-- Test the duplicate count logic
DO $$
DECLARE
    duplicate_requests INTEGER;
BEGIN
    -- Check for duplicate requests using the corrected syntax
    WITH unique_pairs AS (
        SELECT DISTINCT idea_id, recipient_id FROM collaboration_requests
    )
    SELECT (SELECT COUNT(*) FROM collaboration_requests) - (SELECT COUNT(*) FROM unique_pairs) INTO duplicate_requests;
    
    RAISE NOTICE 'Duplicate requests: %', duplicate_requests;
END $$;
