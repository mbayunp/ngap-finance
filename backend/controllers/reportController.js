const db = require('../config/db');

// ==========================================
// GET /api/reports/profit-loss
// Mengambil Laporan Laba Rugi (Accrual Basis)
// ==========================================
exports.getProfitLoss = async (req, res) => {
    // Opsional: filter berdasarkan rentang tanggal
    const { startDate, endDate } = req.query;

    try {
        let dateFilterSales = '';
        let dateFilterCashbook = '';
        let queryParamsSales = [];
        let queryParamsCashbook = [];

        if (startDate && endDate) {
            // Menggunakan transaction_date sesuai skema
            dateFilterSales = 'WHERE transaction_date >= ? AND transaction_date <= ?';
            dateFilterCashbook = 'AND cb.transaction_date >= ? AND cb.transaction_date <= ?';
            queryParamsSales = [startDate, endDate];
            queryParamsCashbook = [startDate, endDate];
        }

        // 1. Agregasi Pendapatan, HPP, dan OPEX dari tabel cash_book
        const query = `
            SELECT 
                coa.account_code, 
                coa.account_name, 
                COALESCE(SUM(cb.cash_in), 0) as total_in, 
                COALESCE(SUM(cb.cash_out), 0) as total_out
            FROM cash_book cb
            JOIN chart_of_accounts coa ON cb.account_id = coa.id
            WHERE coa.account_type = 'Operasional'
            ${dateFilterCashbook}
            GROUP BY coa.id, coa.account_code, coa.account_name
        `;
        const [rows] = await db.query(query, queryParamsCashbook);
        
        let pendapatan = 0;
        let hpp = 0;
        let opex = 0;
        const rincianBeban = [];

        rows.forEach(item => {
            const totalIn = parseFloat(item.total_in);
            const totalOut = parseFloat(item.total_out);

            // Kode 4-xxx adalah Pendapatan Usaha
            if (item.account_code && item.account_code.startsWith('4-')) {
                pendapatan += totalIn;
            }
            
            // Kode 5-xxx adalah HPP / Bahan Baku
            if (item.account_code && item.account_code.startsWith('5-')) {
                hpp += totalOut;
            }
            
            // Kode 6-xxx adalah OPEX / Beban Operasional
            if (item.account_code && item.account_code.startsWith('6-')) {
                if (totalOut > 0) {
                    opex += totalOut;
                    rincianBeban.push({
                        account_name: item.account_name,
                        total: totalOut
                    });
                }
            }
        });

        const labaKotor = pendapatan - hpp;
        const labaBersih = labaKotor - opex;

        res.status(200).json({
            status: 'success',
            data: {
                pendapatan,
                hpp,
                labaKotor,
                opex,
                labaBersih,
                rincianBeban
            }
        });
    } catch (error) {
        console.error('Error generating Profit & Loss report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate Profit & Loss report'
        });
    }
};

// ==========================================
// GET /api/reports/cash-flow
// Mengambil Laporan Arus Kas
// ==========================================
exports.getCashFlow = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let saldoAwal = 0;
        let queryParams = [];

        // 1. Hitung Saldo Awal (sebelum startDate)
        if (startDate) {
            const querySaldoAwal = `
                SELECT 
                    COALESCE(SUM(cash_in), 0) - COALESCE(SUM(cash_out), 0) as saldo_awal
                FROM cash_book
                WHERE transaction_date < ?
            `;
            const [resultSaldoAwal] = await db.query(querySaldoAwal, [startDate]);
            saldoAwal = parseFloat(resultSaldoAwal[0].saldo_awal);
        } else {
            // Jika tidak ada filter tanggal, bisa dihitung dari keseluruhan jika diperlukan,
            // atau asumsikan 0 karena semua ditarik
            saldoAwal = 0;
        }

        // 2. Tarik transaksi rentang tanggal yang dipilih
        let dateFilterDetails = '';
        if (startDate && endDate) {
            dateFilterDetails = 'AND cb.transaction_date >= ? AND cb.transaction_date <= ?';
            queryParams = [startDate, endDate];
        }

        const detailsQuery = `
            SELECT coa.id as account_id, coa.account_name, coa.account_type, SUM(cb.cash_in) as total_in, SUM(cb.cash_out) as total_out 
            FROM cash_book cb 
            JOIN chart_of_accounts coa ON cb.account_id = coa.id 
            WHERE 1=1 ${dateFilterDetails}
            GROUP BY coa.id, coa.account_name, coa.account_type
        `;
        const [details] = await db.query(detailsQuery, queryParams);

        // 3. Kelompokkan ke 3 kategori
        const operasional = [];
        const investasi = [];
        const pendanaan = [];

        let totalOperasional = 0;
        let totalInvestasi = 0;
        let totalPendanaan = 0;

        details.forEach(item => {
            const inAmount = parseFloat(item.total_in);
            const outAmount = parseFloat(item.total_out);
            const netAmount = inAmount - outAmount;

            const entry = {
                account_name: item.account_name,
                account_type: item.account_type,
                total_in: inAmount,
                total_out: outAmount,
                net: netAmount
            };

            // Mengelompokkan langsung berdasarkan tipe akun di tabel chart_of_accounts
            if (item.account_type === 'Investasi') {
                investasi.push(entry);
                totalInvestasi += netAmount;
            } else if (item.account_type === 'Pendanaan') {
                pendanaan.push(entry);
                totalPendanaan += netAmount;
            } else {
                // Operasional atau sisanya
                operasional.push(entry);
                totalOperasional += netAmount;
            }
        });

        const netCashFlow = totalOperasional + totalInvestasi + totalPendanaan;
        const saldoAkhir = saldoAwal + netCashFlow;

        res.status(200).json({
            status: 'success',
            data: {
                saldoAwal,
                operasional,
                investasi,
                pendanaan,
                totalOperasional,
                totalInvestasi,
                totalPendanaan,
                netCashFlow,
                saldoAkhir
            }
        });
    } catch (error) {
        console.error('Error generating Cash Flow report:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate Cash Flow report'
        });
    }
};

