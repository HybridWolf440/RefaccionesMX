-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: fdb1034.awardspace.net
-- Tiempo de generación: 08-05-2026 a las 15:30:36
-- Versión del servidor: 8.0.32
-- Versión de PHP: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `4667291_autopartsmx`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `username`, `email`, `password`, `fecha_registro`) VALUES
(1, 'Erick', 'V', 'al185636@alumnos.uacj.mx', '$2y$10$GStxssrLvyyilibNeAznLOCJU1pSPqCEKLwIHT.X31De4EofkjMpi', '2026-04-29 15:50:43'),
(2, 'Erick', 'Vargas', 'gifof16565@donumart.com', '$2y$10$mvrMIPUYT4zgY5J3mSr3mO39y/itcicumRuIsLKpADBw.Q8YryBRW', '2026-04-29 16:01:42'),
(3, 'Enriqueta', 'Gomez', 'galofef407@gixpos.com', '$2y$10$c3RKDYhJP/gLdHE278KbN.iJ/2SR8uFCk4/7NyBWvNuIm7/hL9kny', '2026-05-04 15:41:07'),
(4, 'Panfiloº', 'Lopez', 'al172156@alumnos.uacj.mx', '$2y$10$6sCSRCZBPQwG7vIfzHUARO.2UF0j0AH3GOcAv0vbIio0ErAim4xU.', '2026-05-08 06:21:14'),
(5, 'User', '.', 'xedave4392@badgerhole.com', '$2y$10$GWj1k.nXQrfgDjweM9l2XuuHH1oqLibeJk9MvpbfklX/kSqTsn34C', '2026-05-08 15:13:58');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
