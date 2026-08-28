UPDATE "Organizer"
SET "name" = 'ЧИ', "updatedAt" = CURRENT_TIMESTAMP
WHERE LOWER("name") = 'newsy';

UPDATE "Organizer"
SET "legalName" = REPLACE(REPLACE(REPLACE("legalName", 'NEWSY', 'ЧИ'), 'Newsy', 'ЧИ'), 'newsy', 'ЧИ'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "legalName" ~* 'newsy';

UPDATE "User"
SET "platformName" = REPLACE(REPLACE(REPLACE("platformName", 'NEWSY', 'ЧИ'), 'Newsy', 'ЧИ'), 'newsy', 'ЧИ'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "platformName" ~* 'newsy';
