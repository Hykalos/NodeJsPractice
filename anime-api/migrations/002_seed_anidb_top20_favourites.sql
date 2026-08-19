-- Seed data from AniDB user 328299 Top Anime favourites (captured 2026-08-18).
-- Safe to run across multiple setups due unique key handling.

INSERT INTO anime (title, year_from, year_to)
VALUES
  ('Elfen Lied', 2004, 2004),
  ('No Game No Life', 2014, 2014),
  ('Kimi no Na wa.', 2016, 2016),
  ('Kotoura-san', 2013, 2013),
  ('Zombie-Loan', 2007, 2007),
  ('Code Geass: Hangyaku no Lelouch R2', 2008, 2008),
  ('Hagane no Renkinjutsushi (2009)', 2009, 2010),
  ('Death Note', 2006, 2007),
  ('Usagi Drop', 2011, 2011),
  ('Nagi no Asukara', 2013, 2014),
  ('Black Rock Shooter (2012)', 2012, 2012),
  ('Working`!!', 2011, 2011),
  ('Hagane no Renkinjutsushi', 2003, 2004),
  ('Mahou Shoujo Madoka Magica', 2011, 2011),
  ('Fullmetal Panic? Fumoffu', 2003, 2003),
  ('Another', 2012, 2012),
  ('Mirai Nikki (2011)', 2011, 2012),
  ('Suzumiya Haruhi no Yuuutsu (2009)', 2009, 2009),
  ('Noragami Aragoto', 2015, 2015),
  ('Kaichou wa Maid-sama!', 2010, 2010)
ON CONFLICT (title, year_from) DO UPDATE
SET year_to = EXCLUDED.year_to,
    updated_at = NOW();
