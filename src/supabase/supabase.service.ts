import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabaseClient: SupabaseClient;
    private readonly logger = new Logger(SupabaseService.name);

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey =
            this.configService.get<string>('SUPABASE_SECRET_KEY') ||
            this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY');


        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Missing Supabase environment variables');
            throw new Error('Missing Supabase environment variables');
        }

        this.supabaseClient = createClient(supabaseUrl, supabaseKey)
    }

    getClient(): SupabaseClient {
        return this.supabaseClient;
    }
}
