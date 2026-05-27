import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qqfsawsritpfjneuahgc.supabase.co'
const supabaseKey = 'sb_publishable_q2qciSQiLbzH97lr1Kg1FQ__1z8PY0u'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})