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

        // 1. Agregasi gross_revenue dan total_hpp dari tabel daily_sales
        // Sesuaikan nama tabel 'daily_sales' jika berbeda di database Anda
        const salesQuery = `
            SELECT 
                COALESCE(SUM(gross_revenue), 0) as total_pendapatan,
                COALESCE(SUM(total_hpp), 0) as total_hpp
            FROM daily_sales
            ${dateFilterSales}
        `;
        const [salesResult] = await db.query(salesQuery, queryParamsSales);
        
        const pendapatan = parseFloat(salesResult[0].total_pendapatan);
        const hpp = parseFloat(salesResult[0].total_hpp);
        const laba_kotor = pendapatan - hpp;

        // 2. Agregasi Pengeluaran (OPEX) dari tabel cash_book
        // Mengecualikan HPP, asumsikan akun bahan baku diawali dengan '6-' (baik di ID, nama, atau kode)
        const opexQuery = `
            SELECT COALESCE(SUM(cb.cash_out), 0) as total_opex
            FROM cash_book cb
            JOIN chart_of_accounts coa ON cb.account_id = coa.id
            WHERE coa.account_type = 'EXPENSE' 
              AND (coa.account_name NOT LIKE '6-%' AND coa.id NOT LIKE '6%')
              ${dateFilterCashbook}
        `;
        const [opexResult] = await db.query(opexQuery, queryParamsCashbook);
        
        const opex = parseFloat(opexResult[0].total_opex);
        const laba_bersih = laba_kotor - opex;

        res.status(200).json({
            status: 'success',
            data: {
                pendapatan,
                hpp,
                labaKotor: laba_kotor,
                opex,
                labaBersih: laba_bersih
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
        let dateFilter = '';
        let queryParams = [];

        if (startDate && endDate) {
            dateFilter = 'WHERE transaction_date >= ? AND transaction_date <= ?';
            queryParams = [startDate, endDate];
        }

        const query = `
            SELECT 
                COALESCE(SUM(cash_in), 0) as total_cash_in,
                COALESCE(SUM(cash_out), 0) as total_cash_out
            FROM cash_book
            ${dateFilter}
        `;
        const [result] = await db.query(query, queryParams);
        
        const cash_in = parseFloat(result[0].total_cash_in);
        const cash_out = parseFloat(result[0].total_cash_out);
        const net_cash_flow = cash_in - cash_out;

        res.status(200).json({
            status: 'success',
            data: {
                cashIn: cash_in,
                cashOut: cash_out,
                netCashFlow: net_cash_flow
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
