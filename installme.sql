CREATE DATABASE fivemdutylogs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;

USE fivemdutylogs;

CREATE TABLE settings(
    id BIGINT AUTO_INCREMENT,
    guild TEXT,
    showPing BOOLEAN DEFAULT 0,
    showDiscord BOOLEAN DEFAULT 1,
    showID BOOLEAN DEFAULT 1,
    altLog TEXT,
    showPlayerGraph BOOLEAN DEFAULT 1,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE servers(
    id BIGINT AUTO_INCREMENT,
    ip TEXT,
    port TEXT,
    guild TEXT,
    prefix TEXT,
    displayVoice TEXT,
    displayText TEXT,
    addedBy TEXT,
    inactive BOOLEAN DEFAULT 0,
    name TEXT,
    maxPlayers BIGINT,
    peakPlayers BIGINT,
    mid TEXT,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE players(
    id BIGINT AUTO_INCREMENT,
    steam TEXT,
    license TEXT,
    license2 TEXT,
    xbl TEXT,
    live TEXT,
    discord TEXT,
    fivem TEXT,
    guild TEXT,
    playtime BIGINT DEFAULT 0,
    server BIGINT,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE errors(
    id BIGINT AUTO_INCREMENT,
    err LONGTEXT,
    guild TEXT,
    interaction TEXT,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE keybinds(
    id BIGINT AUTO_INCREMENT,
    keybind TEXT,
    description TEXT,
    guild TEXT,
    addedBy TEXT,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;


CREATE TABLE patrols(
    id BIGINT AUTO_INCREMENT,
    guild TEXT,
    type BIGINT,
    time TEXT,
    preAnnounceTime TEXT,
    info TEXT,
    days TEXT,
    ping TEXT,
    channel TEXT,
    last BIGINT,
    preSent BOOLEAN DEFAULT 0,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE dailyplayers(
    id BIGINT AUTO_INCREMENT,
    server BIGINT,
    one INT DEFAULT 0,
    two INT DEFAULT 0,
    three INT DEFAULT 0,
    four INT DEFAULT 0,
    five INT DEFAULT 0,
    six INT DEFAULT 0,
    seven INT DEFAULT 0,
    eight INT DEFAULT 0,
    nine INT DEFAULT 0,
    ten INT DEFAULT 0,
    eleven INT DEFAULT 0,
    twelve INT DEFAULT 0,
    thirteen INT DEFAULT 0,
    fourteen INT DEFAULT 0,
    fithteen INT DEFAULT 0,
    sixteen INT DEFAULT 0,
    seventeen INT DEFAULT 0,
    eightteen INT DEFAULT 0,
    nineteen INT DEFAULT 0,
    twenty INT DEFAULT 0,
    twentyone INT DEFAULT 0,
    twentytwo INT DEFAULT 0,
    twentythree INT DEFAULT 0,
    twentyfour INT DEFAULT 0,
    lastReset TEXT,
PRIMARY KEY (id)) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;