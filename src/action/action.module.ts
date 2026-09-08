import { Module } from '@nestjs/common';
import { ActionService } from './action.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    providers: [ActionService],
    exports: [ActionService]
})
export class ActionModule {}
