ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS ai_included boolean NOT NULL DEFAULT false;

UPDATE public.subscriptions s
SET ai_included = true
WHERE s.status IN ('active', 'trialing')
  AND EXISTS (
    SELECT 1
    FROM public.courtesy_entitlement ce
    WHERE ce.user_id = s.user_id::text
      AND ce.tier = 'included_ai'
  );

COMMENT ON COLUMN public.subscriptions.ai_included IS
  'Paid TerminalSync AI entitlement for the active subscription; not a plan or price.';