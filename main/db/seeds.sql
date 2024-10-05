INSERT INTO department (id, name)
VALUES (1, 'Executive'),
       (2, 'Finance'),
       (3, 'Engineering'),
       (4, 'Marketing'),
       (5, 'Sales');

INSERT INTO role (id, title, salary, department_id)
VALUES (1, 'CEO', 200000, 1),
       (2, 'CFO', 210000, 2),
       (3, 'CTO', 220000, 3),
       (4, 'VP of Engineering', 230000, 3),
       (5, 'VP of Marketing', 240000, 4),
       (6, 'VP of Sales', 250000, 5),
       (7, 'Director of Engineering', 260000, 3),
       (8, 'Director of Marketing', 270000, 4),
       (9, 'Director of Sales', 280000, 5),
       (10, 'Manager', 290000, 1);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, 'John', 'Doe', 1, NULL),
       (2, 'Jane', 'Doe', 2, 1),
       (3, 'Alice', 'Smith', 3, 1),
       (4, 'Bob', 'Smith', 4, 1),
       (5, 'Charlie', 'Brown', 5, 1);