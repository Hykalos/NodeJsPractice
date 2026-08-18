-- Rollback for 002_seed_anidb_top20_favourites.sql
-- Removes only the seeded AniDB top-20 rows using (title, year_from) identity.

BEGIN;

DELETE FROM anime
WHERE (title, year_from) IN (
  ('Elfen Lied', 2004),
  ('No Game No Life', 2014),
  ('Kimi no Na wa.', 2016),
  ('Kotoura-san', 2013),
  ('Zombie-Loan', 2007),
  ('Code Geass: Hangyaku no Lelouch R2', 2008),
  ('Hagane no Renkinjutsushi (2009)', 2009),
  ('Death Note', 2006),
  ('Usagi Drop', 2011),
  ('Nagi no Asukara', 2013),
  ('Black Rock Shooter (2012)', 2012),
  ('Working`!!', 2011),
  ('Hagane no Renkinjutsushi', 2003),
  ('Mahou Shoujo Madoka Magica', 2011),
  ('Fullmetal Panic? Fumoffu', 2003),
  ('Another', 2012),
  ('Mirai Nikki (2011)', 2011),
  ('Suzumiya Haruhi no Yuuutsu (2009)', 2009),
  ('Noragami Aragoto', 2015),
  ('Kaichou wa Maid-sama!', 2010)
);

COMMIT;
