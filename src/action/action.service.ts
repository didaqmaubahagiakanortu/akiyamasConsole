import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { buildResponse } from 'src/common/utils/response.util';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class ActionService {
    constructor(private supabase: SupabaseService) { }

    async createAction(table: string, dto: any) {
        try {
            const client = this.supabase.getClient()

            const { data, error } = await client.from(table).insert(dto).select().maybeSingle();
            if (error) throw error

            return buildResponse(HttpStatus.CREATED, 'CREATE', table, data)
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, 'CREATE', table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST);
        }
    }

    async getAction(table: string, column: string, value: number | string, select: string = '*') {
        try {
            const client = this.supabase.getClient()

            const { data, error } = await client.from(table).select(select).eq(column, value).maybeSingle()
            if (error) throw error

            if (!data) throw new NotFoundException(
                buildResponse(HttpStatus.NOT_FOUND, `GET WHERE ${column} = ${value}`, table, null, `Data ${table} WHERE ${column} = ${value} not found`)
            )
            return buildResponse(HttpStatus.OK, `GET WHERE ${column} = ${value}`, table, data)
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, `GET WHERE ${column} = ${value}`, table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST);
        }
    }

    async getManyAction(table: string, page: number = 1, limit: number = 10, filters?: any, select: string = '*') {
        try {
            const client = this.supabase.getClient()
            let query = client.from(table).select(select, { count: 'exact' })

            const start = (Number(page) - 1) * limit
            const end = start + Number(limit) - 1

            const matchOperators = ['role', 'status', 'genre', 'order_id', 'game_id', 'console_id']
            if (filters && typeof filters === 'object') {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (typeof value === 'string' && !matchOperators.includes(key)) {
                            query = query.ilike(key, `%${value}%`)
                        } else if (typeof value === 'object' && ('gte' in value || 'lte' in value)) {
                            if ('gte' in value) query = query.gte(key, value.gte)
                            if ('lte' in value) query = query.lte(key, value.lte)
                        } else {
                            query = query.eq(key, value)
                        }
                    }
                })
            }

            const { data, count, error } = await query.range(start, end)
            if (error) throw error

            const totalPages = Math.ceil((count || 0) / limit)

            return buildResponse(HttpStatus.OK, 'GET', table, {
                data,
                meta: {
                    currentCount: data?.length,
                    totalCount: count,
                    currentPage: page,
                    totalPages,
                    limit
                }
            })
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, 'GET', table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST);
        }
    }

    async updateAction(table: string, id: number | string, dto: any) {
        try {
            const client = this.supabase.getClient()
            const updatedPayload = {
                ...dto,
                updated_at: new Date().toISOString()
            }

            const { data, error } = await client.from(table).update(updatedPayload).eq('id', id).select().maybeSingle();
            if (error) throw error
            if (!data) throw new NotFoundException(buildResponse(HttpStatus.NOT_FOUND, `UPDATE WHERE ID = ${id}`, table, null, `Data ${table} ID ${id} not found`));

            return buildResponse(HttpStatus.OK, `UPDATE WHERE ID = ${id}`, table, data)
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, `UPDATE WHERE ID = ${id}`, table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST);
        }
    }

    async updateManyAction(table: string, column: string, value: string | number, dto: any) {
        try {
            const client = this.supabase.getClient()
            const updatePayload = {
                ...dto,
                updated_at: new Date().toISOString()
            }

            const { data, error } = await client.from(table).update(updatePayload).eq(column, value).select()

            if (error) throw error

            if (!data || data.length === 0) throw new NotFoundException(
                buildResponse(HttpStatus.NOT_FOUND, `UPDATE WHERE ${column} = ${value}`, table, null, `Data ${table} WHERE ${column} = ${value} not found`)
            )

            return buildResponse(HttpStatus.OK, `UPDATE WHERE ${column} = ${value}`, table, data)
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, `UPDATE WHERE ${column} = ${value}`, table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST)
        }
    }

    async deleteAction(table: string, id: string | number) {
        try {
            const client = this.supabase.getClient()

            const { data, error } = await client.from(table).delete().eq('id', id).select().maybeSingle();
            if (error) throw error

            if (!data) throw new NotFoundException(
                buildResponse(HttpStatus.NOT_FOUND, `DELETE WHERE ID = ${id}`, table, null, `Data ${table} WHERE ID = ${id} not found`)
            )

            return buildResponse(HttpStatus.OK, `DELETE WHERE ID = ${id}`, table, data)
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, `DELETE WHERE ID = ${id}`, table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST);
        }
    }

    async deleteManyAction(table: string, column: string, value: string | number) {
        try {
            const client = this.supabase.getClient();

            const { data, error } = await client.from(table).delete().eq(column, value).select()

            if (error) throw error

            if (!data || data.length === 0) throw new NotFoundException(
                buildResponse(HttpStatus.NOT_FOUND, `DELETE WHERE ${column} = ${value}`, table, null, `Data ${table} WHERE ${column} = ${value} not found`)
            )

            return buildResponse(HttpStatus.OK, `DELETE WHERE ${column} = ${value}`, table, data)
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(
                buildResponse(HttpStatus.BAD_REQUEST, `DELETE WHERE ${column} = ${value}`, table, null, error.message || JSON.stringify(error)),
                HttpStatus.BAD_REQUEST)
        }
    }
}
