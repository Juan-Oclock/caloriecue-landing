// =============================================================================
// System Metrics - Database and storage size tracking
//
// Tracks database size and storage usage. The db_size_mb query works
// regardless of the app schema since it uses PostgreSQL system functions.
//
// TODO: Add storage_size_mb query once the Supabase Storage bucket
// structure is known.
// =============================================================================

export async function computeSystemMetrics(client: any) {
  let dbSizeMb = 0;
  let storageSizeMb = 0;

  // -- Database size in MB
  // This query actually works regardless of app schema since it uses
  // PostgreSQL's pg_database_size() system function.
  try {
    const { data } = await client.rpc('pg_database_size', { db_name: 'postgres' });
    if (data) {
      // pg_database_size returns bytes, convert to MB
      dbSizeMb = Math.round((Number(data) / (1024 * 1024)) * 100) / 100;
    }
  } catch (_err) {
    // RPC might not exist yet - default to 0
    console.warn('pg_database_size RPC not available, defaulting db_size_mb to 0');
    dbSizeMb = 0;
  }

  // TODO: Query storage size when bucket structure is known
  //
  // -- Storage size in MB (Supabase Storage)
  // try {
  //   const { data: storageData } = await client
  //     .rpc('get_storage_usage');
  //   storageSizeMb = storageData?.[0]?.total_size_mb ?? 0;
  // } catch (_err) {
  //   storageSizeMb = 0;
  // }
  //
  // Alternative approach using storage API:
  // const { data: buckets } = await client.storage.listBuckets();
  // for (const bucket of buckets ?? []) {
  //   const { data: files } = await client.storage.from(bucket.name).list();
  //   // Sum up file sizes...
  // }

  return {
    db_size_mb: dbSizeMb,
    storage_size_mb: storageSizeMb,
  };
}
