import inquirer from 'inquirer';
import pg from 'pg';
import db from './db.js';

const promptUser = async () => {
    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Employees By Department',
                'View All Employees By Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'View All Roles',
                'Add Role',
                'Remove Role',
                'View All Departments',
                'Add Department',
                'Remove Department',
                'Quit'
            ]
        }
    ]);

    switch (choice) {
        case 'View All Employees':
            await viewAllEmployees();
            break;
        case 'View All Employees By Department':
            await viewEmployeesByDepartment();
            break;
        case 'View All Employees By Manager':
            await viewEmployeesByManager();
            break;
        case 'Add Employee':
            await addEmployee();
            break;
        case 'Remove Employee':
            await removeEmployee();
            break;
        case 'Update Employee Role':
            await updateEmployeeRole();
            break;
        case 'Update Employee Manager':
            await updateEmployeeManager();
            break;
        case 'View All Roles':
            await viewAllRoles();
            break;
        case 'Add Role':
            await addRole();
            break;
        case 'Remove Role':
            await removeRole();
            break;
        case 'View All Departments':
            await viewAllDepartments();
            break;
        case 'Add Department':
            await addDepartment();
            break;
        case 'Remove Department':
            await removeDepartment();
            break;
        default:
            process.exit();
    }

    await promptUser();
};

const viewAllEmployees = async () => {
    const employees = await db.query(`
        SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department_name, e.manager_id
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
    `);

    console.table(employees.rows);
};

const viewEmployeesByDepartment = async () => {
    const departments = await db.query('SELECT * FROM department');
    const { departmentId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'departmentId',
            message: 'Which department would you like to view employees for?',
            choices: departments.rows.map(department => {
                return {
                    name: department.name,
                    value: department.id
                };
            })
        }
    ]);

    const employees = await db.query(`
        SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
        WHERE d.id = $1
    `, [departmentId]);

    console.table(employees.rows);
};

const viewEmployeesByManager = async () => {
    const managers = await db.query(`
        SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN employee m ON e.manager_id = m.id
    `);

    const { managerId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'managerId',
            message: 'Which manager would you like to view employees for?',
            choices: managers.rows.map(manager => ({
                name: manager.manager,
                value: manager.id
            }))
        }
    ]);

    const employees = await db.query(`
        SELECT e.id, e.first_name, e.last_name, title, name AS department, salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        LEFT JOIN role r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
        WHERE m.id = $1
    `, [managerId]);

    console.table(employees.rows);
};

const addEmployee = async () => {
    const roles = await db.query('SELECT * FROM role');
    const employees = await db.query('SELECT * FROM employee');

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter employee first name:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter employee last name:'
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select employee role:',
            choices: roles.rows.map(role => ({
                name: role.title,
                value: role.id
            }))
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select employee manager:',
            choices: employees.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }))
        }
    ]);

    await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId]);
    console.log('Employee added successfully!');
};

const removeEmployee = async () => {
    const employees = await db.query('SELECT * FROM employee');

    const { employeeId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select employee to remove:',
            choices: employees.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }))
        }
    ]);

    await db.query('DELETE FROM employee WHERE id = $1', [employeeId]);
    console.log('Employee removed successfully!');
};

const updateEmployeeRole = async () => {
    const employees = await db.query('SELECT * FROM employee');
    const roles = await db.query('SELECT * FROM role');

    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select employee to update role:',
            choices: employees.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }))
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select new role:',
            choices: roles.rows.map(role => ({
                name: role.title,
                value: role.id
            }))
        }
    ]);

    await db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
    console.log('Employee role updated successfully!');
};

const updateEmployeeManager = async () => {
    const employees = await db.query('SELECT * FROM employee');

    const { employeeId, managerId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select employee to update manager:',
            choices: employees.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }))
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select new manager:',
            choices: employees.rows.map(employee => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id
            }))
        }
    ]);

    await db.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [managerId, employeeId]);
    console.log('Employee manager updated successfully!');
};

const viewAllRoles = async () => {
    const roles = await db.query(`
        SELECT r.id, title, salary, name AS department
        FROM role r
        LEFT JOIN department d ON r.department_id = d.id
    `);

    console.table(roles.rows);
};

const addRole = async () => {
    const departments = await db.query('SELECT * FROM department');

    const { title, salary, departmentId } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter role title:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter role salary:'
        },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select role department:',
            choices: departments.rows.map(department => ({
                name: department.name,
                value: department.id
            }))
        }
    ]);

    await db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
    console.log('Role added successfully!');
};

const removeRole = async () => {
    const roles = await db.query('SELECT * FROM role');

    const { roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'roleId',
            message: 'Select role to remove:',
            choices: roles.rows.map(role => ({
                name: role.title,
                value: role.id
            }))
        }
    ]);

    await db.query('DELETE FROM role WHERE id = $1', [roleId]);
    console.log('Role removed successfully!');
};

const viewAllDepartments = async () => {
    const departments = await db.query('SELECT * FROM department');
    console.table(departments.rows);
};

const addDepartment = async () => {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter department name:'
        }
    ]);

    await db.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log('Department added successfully!');
};

const removeDepartment = async () => {
    const departments = await db.query('SELECT * FROM department');

    const { departmentId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select department to remove:',
            choices: departments.rows.map(department => ({
                name: department.name,
                value: department.id
            }))
        }
    ]);

    await db.query('DELETE FROM department WHERE id = $1', [departmentId]);
    console.log('Department removed successfully!');
};

promptUser();

// to run the application, use the following command:
// node src/index.js