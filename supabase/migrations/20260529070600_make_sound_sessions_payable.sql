update public.pricing_plans
set
  price = case id
    when '3a111111-1111-4111-8111-777777777777' then '3 000 ₽'
    when '3a111111-1111-4111-8111-888888888888' then '3 500 ₽'
    else price
  end,
  amount_cents = case id
    when '3a111111-1111-4111-8111-777777777777' then 300000
    when '3a111111-1111-4111-8111-888888888888' then 350000
    else amount_cents
  end,
  currency = 'RUB',
  visits_total = 1,
  valid_days = 30,
  is_payable = true,
  updated_at = now()
where id in (
  '3a111111-1111-4111-8111-777777777777',
  '3a111111-1111-4111-8111-888888888888'
);
