-- RUN THE init.sh to test the apps
-- Login: admin@example.com / password123
-- API password field is base64 encoded, so send: cGFzc3dvcmQxMjM=
DECLARE
    v_employee_id   NUMBER;
    v_employee_count NUMBER;
    v_user_count    NUMBER;
    v_now           VARCHAR2(14);
BEGIN
    v_now := TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');

    SELECT COUNT(1) INTO v_employee_count
    FROM m_employee
    WHERE code = 'EMP001';

    IF v_employee_count = 0 THEN
        INSERT INTO m_employee (
            code, full_name, date_of_birth, staff_level, join_since, flg_active,
            created_by, created_at, updated_by, updated_at
        ) VALUES (
            'EMP001', 'Administrator', '19900101', 'L1', '20200101', 'Y',
            'system', v_now, 'system', v_now
        );
    END IF;

    SELECT id INTO v_employee_id
    FROM m_employee
    WHERE code = 'EMP001';

    SELECT COUNT(1) INTO v_user_count
    FROM m_user
    WHERE username = 'admin' OR email = 'admin@example.com';

    IF v_user_count = 0 THEN
        INSERT INTO m_user (
            employee_id, username, email, password, role, flg_active,
            created_by, created_at, updated_by, updated_at
        ) VALUES (
            v_employee_id, 'admin', 'admin@example.com',
            '34d0c0c5ecc1369c82f9bb5eedfb8715:5f113679875e4c0b6a6460c5ced3d5ed38c4966fe6fdc594f7005cd382c1bdd6633c9520d657d70c1d1fa9a984d7df38194e73908080cb907125491c677350e3',
            'admin', 'Y', 'system', v_now, 'system', v_now
        );
    END IF;

    COMMIT;
END;
/
