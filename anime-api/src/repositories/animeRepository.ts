import type { Pool } from "pg";
import type { Anime, AnimeListQuery, AnimeListResult, AnimeWriteInput } from "../models/anime";

type AnimeRow = {
  id: string;
  title: string;
  year_from: number;
  year_to: number | null;
  created_at: string;
  updated_at: string;
};

function mapAnime(row: AnimeRow): Anime {
  return {
    id: row.id,
    title: row.title,
    yearFrom: row.year_from,
    yearTo: row.year_to,
    ongoing: row.year_to == null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createAnimeRepository(pool: Pool) {
  return {
    async checkHealth(): Promise<void> {
      await pool.query("SELECT 1");
    },

    async create(input: AnimeWriteInput): Promise<Anime> {
      const result = await pool.query<AnimeRow>(
        `
          INSERT INTO anime(title, year_from, year_to)
          VALUES ($1, $2, $3)
          RETURNING id, title, year_from, year_to, created_at, updated_at
        `,
        [input.title, input.yearFrom, input.yearTo ?? null]
      );

      return mapAnime(result.rows[0]);
    },

    async list(query: AnimeListQuery): Promise<AnimeListResult> {
      const filters: string[] = [];
      const values: Array<string | number> = [];

      if (query.titleContains) {
        values.push(`%${query.titleContains}%`);
        filters.push(`title ILIKE $${values.length}`);
      }
      if (query.ongoing === "true") {
        filters.push("year_to IS NULL");
      }
      if (query.ongoing === "false") {
        filters.push("year_to IS NOT NULL");
      }
      if (query.yearFromGte != null) {
        values.push(query.yearFromGte);
        filters.push(`year_from >= $${values.length}`);
      }
      if (query.yearFromLte != null) {
        values.push(query.yearFromLte);
        filters.push(`year_from <= $${values.length}`);
      }

      const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
      const offset = (query.page - 1) * query.pageSize;
      const orderBy = query.sortBy === "yearFrom" ? "year_from" : "title";
      const orderDirection = query.sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

      values.push(query.pageSize);
      values.push(offset);

      const listSql = `
        SELECT id, title, year_from, year_to, created_at, updated_at
        FROM anime
        ${whereClause}
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
      `;

      const countSql = `SELECT COUNT(*)::INT AS total FROM anime ${whereClause}`;

      const [listResult, countResult] = await Promise.all([
        pool.query<AnimeRow>(listSql, values),
        pool.query<{ total: number }>(countSql, values.slice(0, values.length - 2))
      ]);

      return {
        data: listResult.rows.map(mapAnime),
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          total: countResult.rows[0].total
        }
      };
    },

    async getById(id: string): Promise<Anime | null> {
      const result = await pool.query<AnimeRow>(
        `
          SELECT id, title, year_from, year_to, created_at, updated_at
          FROM anime
          WHERE id = $1
        `,
        [id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return mapAnime(result.rows[0]);
    },

    async update(id: string, input: AnimeWriteInput): Promise<Anime | null> {
      const result = await pool.query<AnimeRow>(
        `
          UPDATE anime
          SET title = $1,
              year_from = $2,
              year_to = $3,
              updated_at = NOW()
          WHERE id = $4
          RETURNING id, title, year_from, year_to, created_at, updated_at
        `,
        [input.title, input.yearFrom, input.yearTo ?? null, id]
      );

      if (result.rowCount === 0) {
        return null;
      }

      return mapAnime(result.rows[0]);
    },

    async delete(id: string): Promise<boolean> {
      const result = await pool.query("DELETE FROM anime WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    }
  };
}
