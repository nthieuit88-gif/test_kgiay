
import { createClient } from '@supabase/supabase-js';

const projectUrl = 'https://ybdyywyxgydnvcyouuhb.supabase.co';
const anonKey = 'sb_publishable_2DlSuXFBtG7i6KOsDioCag_QbfDnbpy';

export const supabase = createClient(projectUrl, anonKey);
