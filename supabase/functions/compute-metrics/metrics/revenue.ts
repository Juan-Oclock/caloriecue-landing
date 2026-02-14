// =============================================================================
// Revenue Metrics - Subscription and financial tracking
//
// Tracks MRR, ARR, subscriber counts, daily revenue, average revenue per user,
// and lifetime value estimates.
//
// Monetary values are stored in cents (integers) to avoid floating-point issues.
//
// TODO: Replace stub returns with actual queries once the CalorieCue app
// database schema is finalized.
// =============================================================================

export async function computeRevenueMetrics(client: any) {
  const today = new Date().toISOString().split('T')[0];

  // TODO: Replace with actual queries when app schema is known
  //
  // -- Monthly Recurring Revenue (sum of all active subscription amounts)
  // const { data: mrrData } = await client
  //   .from('subscriptions')
  //   .select('price_cents, billing_interval')
  //   .eq('status', 'active');
  // const mrrCents = mrrData?.reduce((sum: number, sub: any) => {
  //   return sum + (sub.billing_interval === 'year'
  //     ? Math.round(sub.price_cents / 12)
  //     : sub.price_cents);
  // }, 0) ?? 0;
  //
  // -- Annual Recurring Revenue
  // const arrCents = mrrCents * 12;
  //
  // -- Monthly subscribers count
  // const { count: monthlySubscribers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'active')
  //   .eq('billing_interval', 'month');
  //
  // -- Yearly subscribers count
  // const { count: yearlySubscribers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'active')
  //   .eq('billing_interval', 'year');
  //
  // -- New subscriptions today
  // const { count: newSubscriptionsToday } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .gte('created_at', today);
  //
  // -- Cancellations today
  // const { count: cancellationsToday } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'canceled')
  //   .gte('canceled_at', today);
  //
  // -- Revenue collected today (from payment_history or invoices table)
  // const { data: revenueData } = await client
  //   .from('payments')
  //   .select('amount_cents')
  //   .gte('created_at', today)
  //   .eq('status', 'succeeded');
  // const revenueTodayCents = revenueData?.reduce(
  //   (sum: number, p: any) => sum + p.amount_cents, 0
  // ) ?? 0;
  //
  // -- Average revenue per user
  // const { count: totalPaidUsers } = await client
  //   .from('subscriptions')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'active');
  // const avgRevenuePerUserCents = totalPaidUsers
  //   ? Math.round(mrrCents / totalPaidUsers)
  //   : 0;
  //
  // -- LTV estimate (avg monthly revenue * avg subscription length in months)
  // const { data: ltvData } = await client
  //   .rpc('compute_ltv_estimate');
  // const ltvEstimateCents = ltvData?.[0]?.ltv_cents ?? 0;

  return {
    mrr_cents: 0,
    arr_cents: 0,
    monthly_subscribers: 0,
    yearly_subscribers: 0,
    new_subscriptions_today: 0,
    cancellations_today: 0,
    revenue_today_cents: 0,
    avg_revenue_per_user_cents: 0,
    ltv_estimate_cents: 0,
  };
}
