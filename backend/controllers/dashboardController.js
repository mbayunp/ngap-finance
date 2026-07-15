const db = require('../config/db');

// ==========================================
// GET /api/dashboard/summary
// Mengembalikan metrik ringkasan cepat untuk card di halaman utama
// ==========================================
exports.getDashboardSummary = async (req, res) => {
    try {
        // 1. Total Kas Saat Ini (Cash In - Cash Out)
        const [cashResult] = await db.query(`
            SELECT COALESCE(SUM(cash_in) - SUM(cash_out), 0) AS total_kas 
            FROM cash_book
        `);
        const totalKas = parseFloat(cashResult[0].total_kas);

        // 2. Piutang Platform Aktif (Total Net Settlement yang masih pending)
        const [receivableResult] = await db.query(`
            SELECT COALESCE(SUM(net_settlement), 0) AS total_piutang 
            FROM daily_sales 
            WHERE status_pencairan = 'PENDING'
        `);
        const totalPiutang = parseFloat(receivableResult[0].total_piutang);

        // 3. Total Penjualan Bulan Ini (Berdasarkan bulan dan tahun berjalan)
        // Catatan: sesuaikan nama kolom 'date' dengan skema Anda jika berbeda (misal: 'sale_date')
        const [salesResult] = await db.query(`
            SELECT COALESCE(SUM(gross_revenue), 0) AS total_penjualan_bulan_ini 
            FROM daily_sales 
            WHERE MONTH(transaction_date) = MONTH(CURRENT_DATE()) 
              AND YEAR(transaction_date) = YEAR(CURRENT_DATE())
        `);
        const totalPenjualanBulanIni = parseFloat(salesResult[0].total_penjualan_bulan_ini);

        res.status(200).json({
            status: 'success',
            data: {
                total_kas: totalKas,
                piutang_aktif: totalPiutang,
                penjualan_bulan_ini: totalPenjualanBulanIni
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching dashboard summary'
        });
    }
};

// ==========================================
// GET /api/dashboard/channel-analysis
// Mengembalikan performa profitabilitas per channel penjualan
// ==========================================
exports.getChannelAnalysis = async (req, res) => {
    try {
        // Menggabungkan daily_sales dan channels, lalu dikelompokkan per channel
        const query = `
            SELECT 
                c.name AS channel_name,
                COALESCE(SUM(ds.gross_revenue), 0) AS total_gross_revenue,
                COALESCE(SUM(ds.total_hpp), 0) AS total_hpp,
                COALESCE(SUM(ds.commission_amount), 0) AS total_komisi,
                COALESCE(SUM(ds.net_settlement), 0) AS net_settlement
            FROM daily_sales ds
            JOIN channels c ON ds.channel_id = c.id
            GROUP BY c.id, c.name
        `;
        const [rows] = await db.query(query);

        // Menghitung persentase margin secara dinamis
        const analysisData = rows.map(row => {
            const netSettlement = parseFloat(row.net_settlement);
            const totalHpp = parseFloat(row.total_hpp);
            let marginPercentage = 0;

            if (netSettlement > 0) {
                marginPercentage = ((netSettlement - totalHpp) / netSettlement) * 100;
            }

            return {
                channel_name: row.channel_name,
                total_gross_revenue: parseFloat(row.total_gross_revenue),
                total_hpp: totalHpp,
                total_komisi: parseFloat(row.total_komisi),
                net_settlement: netSettlement,
                margin_percentage: parseFloat(marginPercentage.toFixed(2)) // Dibulatkan 2 desimal
            };
        });

        res.status(200).json({
            status: 'success',
            data: analysisData
        });
    } catch (error) {
        console.error('Error fetching channel analysis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching channel analysis'
        });
    }
};

// ==========================================
// GET /api/dashboard/bep-analysis
// Menghitung status pencapaian BEP bulan berjalan
// ==========================================
exports.getBepAnalysis = async (req, res) => {
    try {
        // 1. Hitung Fixed Costs (OPEX) bulan berjalan
        // Memfilter berdasarkan tipe akun EXPENSE dan berawalan '6-' (asumsi OPEX)
        const opexQuery = `
            SELECT COALESCE(SUM(cb.cash_out), 0) AS total_opex
            FROM cash_book cb
            JOIN chart_of_accounts coa ON cb.account_id = coa.id
            WHERE coa.account_type = 'EXPENSE' 
              AND (coa.account_name LIKE '6-%' OR coa.id LIKE '6%')
              AND MONTH(cb.transaction_date) = MONTH(CURRENT_DATE())
              AND YEAR(cb.transaction_date) = YEAR(CURRENT_DATE())
        `;
        const [opexResult] = await db.query(opexQuery);
        const fixedCosts = parseFloat(opexResult[0].total_opex);

        // 2. Hitung Contribution Margin (Gross Revenue - HPP) bulan berjalan
        const cmQuery = `
            SELECT 
                COALESCE(SUM(gross_revenue), 0) AS total_gross_revenue,
                COALESCE(SUM(total_hpp), 0) AS total_hpp
            FROM daily_sales
            WHERE MONTH(transaction_date) = MONTH(CURRENT_DATE())
              AND YEAR(transaction_date) = YEAR(CURRENT_DATE())
        `;
        const [cmResult] = await db.query(cmQuery);
        const contributionMargin = parseFloat(cmResult[0].total_gross_revenue) - parseFloat(cmResult[0].total_hpp);

        // 3. Tentukan status apakah sudah melewati BEP
        const isBepReached = contributionMargin > fixedCosts;

        res.status(200).json({
            status: 'success',
            data: {
                fixed_costs: fixedCosts,
                contribution_margin: contributionMargin,
                is_bep_reached: isBepReached
            }
        });
    } catch (error) {
        console.error('Error fetching BEP analysis:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching BEP analysis'
        });
    }
};

// ==========================================
// GET /api/dashboard/recent-activities
// Mengambil ringkasan 5 aktivitas terakhir
// ==========================================
exports.getRecentActivities = async (req, res) => {
    try {
        const salesQuery = `
            SELECT ds.transaction_date, c.name AS channel_name, ds.net_settlement 
            FROM daily_sales ds 
            JOIN channels c ON ds.channel_id = c.id 
            ORDER BY ds.transaction_date DESC, ds.id DESC LIMIT 5
        `;
        
        const purchasesQuery = `
            SELECT cb.transaction_date, coa.account_name, cb.cash_out 
            FROM cash_book cb 
            JOIN chart_of_accounts coa ON cb.account_id = coa.id 
            WHERE coa.account_type = 'EXPENSE' 
            ORDER BY cb.transaction_date DESC, cb.id DESC LIMIT 5
        `;
        
        const incomesQuery = `
            SELECT cb.transaction_date, coa.account_name, cb.cash_in 
            FROM cash_book cb 
            JOIN chart_of_accounts coa ON cb.account_id = coa.id 
            WHERE coa.account_type = 'INCOME' 
            ORDER BY cb.transaction_date DESC, cb.id DESC LIMIT 5
        `;

        const [[recentSales], [recentPurchases], [recentIncomes]] = await Promise.all([
            db.query(salesQuery),
            db.query(purchasesQuery),
            db.query(incomesQuery)
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                recentSales,
                recentPurchases,
                recentIncomes
            }
        });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching recent activities'
        });
    }
};
