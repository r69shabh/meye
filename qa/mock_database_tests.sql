-- ==============================================================================
-- QA Database Verification Queries (Mock)
-- Description: These queries demonstrate SQL knowledge as required by the QA
--              Intern JD. Since Meye uses localStorage, these represent the 
--              hypothetical backend verification queries a QA would run if 
--              tasks and users were stored in a relational database.
-- ==============================================================================

-- 1. Sanity Check: Verify a new user was created successfully after OAuth
SELECT id, github_username, email, created_at, last_login
FROM users
WHERE github_username = 'test_qa_user'
ORDER BY created_at DESC
LIMIT 1;

-- 2. Functional Test: Verify a task was inserted with the correct parsed NLP date
SELECT t.task_id, t.user_id, t.description, t.due_date, t.status
FROM tasks t
JOIN users u ON t.user_id = u.id
WHERE u.github_username = 'test_qa_user' 
  AND t.description LIKE '%Remind me to call John%'
  AND t.status = 'active';

-- 3. Regression Test: Ensure completed tasks are actually marked as 'completed'
--    and not deleted from the database.
SELECT count(*) as completed_tasks_count
FROM tasks
WHERE user_id = 101 AND status = 'completed';

-- 4. Edge Case Data Integrity: Find tasks with missing due dates 
--    (testing the NLP parsing failure handling)
SELECT task_id, description
FROM tasks
WHERE due_date IS NULL AND status = 'active';

-- 5. Teardown: Clean up test data after automated test suite runs
DELETE FROM tasks 
WHERE user_id IN (SELECT id FROM users WHERE github_username LIKE 'test_qa_%');

DELETE FROM users 
WHERE github_username LIKE 'test_qa_%';
