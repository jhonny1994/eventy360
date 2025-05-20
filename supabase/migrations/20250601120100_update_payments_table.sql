-- Add a column for storing the path to the payment proof document
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS proof_document_path TEXT;

-- Add a column for reference number (useful for bank transfers or other forms of payment)
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS reference_number TEXT;

-- Add a column for notes from the payer
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payer_notes TEXT;

-- Add comments to the new columns
COMMENT ON COLUMN public.payments.proof_document_path IS 'Path to the payment proof document in the storage bucket';
COMMENT ON COLUMN public.payments.reference_number IS 'Reference number for the payment, useful for tracking bank transfers';
COMMENT ON COLUMN public.payments.payer_notes IS 'Additional notes provided by the payer'; 