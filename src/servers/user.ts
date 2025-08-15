import {v4 as uuidv4} from 'uuid';
import {getDb} from "~/libs/db";

const db = getDb();
export const checkAndSaveUser = async (name: string, email: string, image: string, last_login_ip: string) => {
  const results = await db.query(`select * from user_info where email=$1;`, [email]);
  const users = results.rows;
  if (users.length <= 0) {
    const result = {
      user_id: '',
      name: '',
      email: '',
      image: '',
    }
    // 新增
    const strUUID = uuidv4().replace(/-/g, '');
    await db.query('insert into user_info(user_id,name,email,image,last_login_ip) values($1,$2,$3,$4,$5)',
      [strUUID, name, email, image, last_login_ip]);

    result.user_id = strUUID;
    result.name = name;
    result.email = email;
    result.image = image;
    return result;
  } else {
    // 更新
    const user = users[0];
    await db.query('update user_info set name=$1,image=$2,last_login_ip=$3,updated_at=now() where id=$4',
      [name, image, last_login_ip, user.id]);
    return user;
  }
}

export const getUserById = async (user_id) => {
  const results = await db.query('select * from user_info where user_id=$1', [user_id]);
  const users = results.rows;
  if (users.length > 0) {
    const user = users[0];
    return {
      user_id: user_id,
      name: user.name,
      email: user.email,
      image: user.image,
      current_plan: user.current_plan || 'free',
      subscription_status: user.subscription_status || 'active',
      status: 1
    }
  }
  return {
    user_id: user_id,
    name: '',
    email: '',
    image: '',
    current_plan: 'free',
    subscription_status: 'active',
    status: 0
  }
}

export const getUserByEmail = async (email) => {
  const results = await db.query('select * from user_info where email=$1', [email]);
  const users = results.rows;
  if (users.length > 0) {
    const user = users[0];
    return {
      user_id: user.user_id,
      name: user.name,
      email: email,
      image: user.image,
      current_plan: user.current_plan || 'free',
      subscription_status: user.subscription_status || 'active',
      status: 1
    }
  }
  return {
    user_id: '',
    name: '',
    email: email,
    image: '',
    current_plan: 'free',
    subscription_status: 'active',
    status: 0
  }
}
