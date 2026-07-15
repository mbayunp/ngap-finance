-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 15 Jul 2026 pada 06.04
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ngap_finance`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `cash_book`
--

CREATE TABLE `cash_book` (
  `id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `account_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `cash_in` decimal(15,2) NOT NULL DEFAULT 0.00,
  `cash_out` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cash_book`
--

INSERT INTO `cash_book` (`id`, `transaction_date`, `account_id`, `description`, `cash_in`, `cash_out`, `created_at`) VALUES
(1, '2026-07-01', 1, 'Modal Awal Kas Bulan Juli', 5000000.00, 0.00, '2026-07-15 03:07:20'),
(2, '2026-07-02', 4, 'Belanja Daging & Beras', 0.00, 1500000.00, '2026-07-15 03:07:20'),
(3, '2026-07-05', 4, 'Beli Kemasan / Box', 0.00, 300000.00, '2026-07-15 03:07:20'),
(4, '2026-07-03', 5, 'Bayar Sewa Tempat Juli', 0.00, 1000000.00, '2026-07-15 03:07:20'),
(5, '2026-07-04', 7, 'Token Listrik', 0.00, 200000.00, '2026-07-15 03:07:20'),
(6, '2026-07-02', 2, 'Setoran Uang Tunai Kasir (Offline)', 204000.00, 0.00, '2026-07-15 03:22:28'),
(7, '2026-07-03', 3, 'Pencairan Saldo GrabFood (Transaksi 1 Juli)', 751200.00, 0.00, '2026-07-15 03:22:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `channels`
--

CREATE TABLE `channels` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `commission_rate` decimal(5,4) DEFAULT 0.0000,
  `settlement_lag_days` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `channels`
--

INSERT INTO `channels` (`id`, `name`, `commission_rate`, `settlement_lag_days`, `created_at`) VALUES
(1, 'GrabFood', 0.2000, 2, '2026-07-15 02:35:39'),
(2, 'GoFood', 0.2000, 2, '2026-07-15 02:35:39'),
(3, 'ShopeeFood', 0.1500, 7, '2026-07-15 02:35:39'),
(4, 'Offline', 0.0000, 0, '2026-07-15 02:35:39');

-- --------------------------------------------------------

--
-- Struktur dari tabel `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` int(11) NOT NULL,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` enum('INCOME','EXPENSE','ASSET') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `created_at`) VALUES
(1, '1-1000', 'Saldo Awal Kas', 'ASSET', '2026-07-15 02:35:39'),
(2, '4-1000', 'Pendapatan - Offline', 'INCOME', '2026-07-15 02:35:39'),
(3, '4-2000', 'Pencairan Piutang Aplikator', 'INCOME', '2026-07-15 02:35:39'),
(4, '5-1000', 'Pembelian Bahan Baku & Kemasan', 'EXPENSE', '2026-07-15 02:35:39'),
(5, '6-1000', 'OPEX - Sewa', 'EXPENSE', '2026-07-15 02:35:39'),
(6, '6-1100', 'OPEX - Gaji & Upah', 'EXPENSE', '2026-07-15 02:35:39'),
(7, '6-1200', 'OPEX - Listrik & Air', 'EXPENSE', '2026-07-15 02:35:39'),
(8, '6-1300', 'OPEX - Pemasaran / Gas / Lainnya', 'EXPENSE', '2026-07-15 02:35:39');

-- --------------------------------------------------------

--
-- Struktur dari tabel `daily_sales`
--

CREATE TABLE `daily_sales` (
  `id` int(11) NOT NULL,
  `transaction_date` date NOT NULL,
  `channel_id` int(11) NOT NULL,
  `gross_revenue` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_hpp` decimal(15,2) NOT NULL DEFAULT 0.00,
  `commission_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_settlement` decimal(15,2) NOT NULL DEFAULT 0.00,
  `settlement_date` date NOT NULL,
  `status_pencairan` enum('PENDING','PAID') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `daily_sales`
--

INSERT INTO `daily_sales` (`id`, `transaction_date`, `channel_id`, `gross_revenue`, `total_hpp`, `commission_amount`, `net_settlement`, `settlement_date`, `status_pencairan`, `created_at`) VALUES
(1, '2026-07-01', 1, 939000.00, 413230.00, 187800.00, 751200.00, '2026-07-03', 'PENDING', '2026-07-15 03:07:20'),
(2, '2026-07-02', 4, 204000.00, 89680.00, 0.00, 204000.00, '2026-07-02', 'PAID', '2026-07-15 03:07:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `daily_sale_items`
--

CREATE TABLE `daily_sale_items` (
  `id` int(11) NOT NULL,
  `daily_sale_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `subtotal_price` decimal(15,2) NOT NULL,
  `subtotal_hpp` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `daily_sale_items`
--

INSERT INTO `daily_sale_items` (`id`, `daily_sale_id`, `product_id`, `qty`, `subtotal_price`, `subtotal_hpp`) VALUES
(1, 1, 1, 11, 165000.00, 77000.00),
(2, 1, 2, 19, 494000.00, 212230.00),
(3, 1, 3, 8, 280000.00, 124000.00),
(4, 2, 1, 2, 30000.00, 14000.00),
(5, 2, 2, 4, 104000.00, 44680.00),
(6, 2, 3, 2, 70000.00, 31000.00);

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `default_hpp` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `default_hpp`, `created_at`) VALUES
(1, 'Mini', 15000.00, 7000.00, '2026-07-15 02:35:39'),
(2, 'Original', 26000.00, 11170.00, '2026-07-15 02:35:39'),
(3, 'Gila', 35000.00, 15500.00, '2026-07-15 02:35:39');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `cash_book`
--
ALTER TABLE `cash_book`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `transaction_date` (`transaction_date`);

--
-- Indeks untuk tabel `channels`
--
ALTER TABLE `channels`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_code` (`account_code`);

--
-- Indeks untuk tabel `daily_sales`
--
ALTER TABLE `daily_sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `channel_id` (`channel_id`),
  ADD KEY `transaction_date` (`transaction_date`),
  ADD KEY `status_pencairan` (`status_pencairan`);

--
-- Indeks untuk tabel `daily_sale_items`
--
ALTER TABLE `daily_sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `daily_sale_id` (`daily_sale_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `cash_book`
--
ALTER TABLE `cash_book`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `channels`
--
ALTER TABLE `channels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `daily_sales`
--
ALTER TABLE `daily_sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `daily_sale_items`
--
ALTER TABLE `daily_sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `cash_book`
--
ALTER TABLE `cash_book`
  ADD CONSTRAINT `cash_book_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`);

--
-- Ketidakleluasaan untuk tabel `daily_sales`
--
ALTER TABLE `daily_sales`
  ADD CONSTRAINT `daily_sales_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`);

--
-- Ketidakleluasaan untuk tabel `daily_sale_items`
--
ALTER TABLE `daily_sale_items`
  ADD CONSTRAINT `daily_sale_items_ibfk_1` FOREIGN KEY (`daily_sale_id`) REFERENCES `daily_sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `daily_sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
