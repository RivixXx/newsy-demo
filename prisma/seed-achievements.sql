INSERT INTO "Achievement" ("id", "key", "name", "description", "icon", "isCustom", "isApproved", "pointsRequired", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'first_step', 'Первый шаг', 'Завершил первый этап челленджа', '👣', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'photo_master', 'Мастер фото', 'Загрузил более 10 фото в челленджах', '📸', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'explorer', 'Исследователь', 'Участвовал в 5 разных челленджах', '🧭', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'speed_demon', 'Демон скорости', 'Завершил челлендж быстрее всех', '⚡', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'social_butterfly', 'Социальная бабочка', 'Поделился челленджем с 10 друзьями', '🦋', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'streak_master', 'Мастер серии', '7 дней подряд выполняет задания', '🔥', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'team_player', 'Командный игрок', 'Завершил кооперативный челлендж', '🤝', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'creative_soul', 'Творческая душа', 'Выиграл челлендж в категории Искусство', '🎨', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'tech_wizard', 'Техно-волшебник', 'Выиграл челлендж в категории Технологии', '🧙', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'athlete', 'Атлет', 'Завершил 3 спортивных челленджа', '🏋️', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'scholar', 'Учёный', 'Завершил 3 образовательных челленджа', '🎓', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'quest_hunter', 'Охотник за квестами', 'Завершил 5 квестов', '🗺️', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'perfectionist', 'Перфекционист', 'Получил максимальный балл во всех этапах', '💎', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'early_bird', 'Ранняя пташка', 'Записался в челлендж в первый день', '🐦', false, true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'night_owl', 'Ночная сова', 'Выполнил задание после полуночи', '🦉', false, true, 0, NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;
