/* to join all the tables */
SELECT * FROM users
JOIN user_roles ON users.id = user_roles.user_id
JOIN roles ON user_roles.role_id = roles.id
JOIN departments ON roles.department_id = departments.id
JOIN employees ON roles.id = employees.role_id
JOIN employees AS managers ON employees.manager_id = managers.id;
/* to get the total salary of the company */
SELECT SUM(salary) FROM roles;

