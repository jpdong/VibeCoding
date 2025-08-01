import {getLanguage} from "~/servers/language";
import {v4 as uuidv4} from 'uuid';
import {getDb} from "~/libs/db";
import {generateTitle} from "~/servers/summaryContent";

const db = getDb();

export const saveChatText = async (json) => {
  const input_text = json.input_text;
  const output_text = json.output_text;
  const user_id = json.user_id;
  const language = await getLanguage(input_text.substring(0, 64));
  let title = await generateTitle(input_text, output_text, language);

  const uid = uuidv4().replace(/-/g, '');

  await db.query('insert into chat_record (input_text, output_text, user_id, uid, language, title) values ($1, $2, $3, $4, $5, $6)', [input_text, output_text, user_id, uid, language, title]);

  return json;
}

export const getLatestChatResultList = async (locale) => {
  const pageSize = Number(process.env.NEXT_PUBLIC_INDEX_PAGES_SIZE);
  const skipSize = 0;

  let resultListRows;
  if (locale == 'en') {
    resultListRows = await db.query(`
    select cr.*, ui.name as user_name from chat_record cr
         left join user_info ui on ui.user_id=cr.user_id
         where cr.is_public=$3 and language not in ('zh')
         order by cr.created_at desc limit $1 offset $2
  `, [pageSize, skipSize, true]);
  } else {
    resultListRows = await db.query(`
    select cr.*, ui.name as user_name from chat_record cr
         left join user_info ui on ui.user_id=cr.user_id
         where cr.is_public=$3 and language=$4
         order by cr.created_at desc limit $1 offset $2
  `, [pageSize, skipSize, true, locale]);
  }
  const resultList = resultListRows.rows;

  if (resultList.length > 0) {
    return resultList;
  }

  return [];
}

export const getChatDetail = async (loclae, uid) => {

  const {rows: resultList} = await db.query(`
    select cr.*, ui.name as user_name from chat_record cr
         left join user_info ui on ui.user_id=cr.user_id
         where cr.uid=$1
  `, [uid]);
  if (resultList.length > 0) {
    return resultList[0];
  }

  return {
    status: 404
  };
}


export const getPublicResultList = async (locale, current_page) => {

  const pageSize = Number(process.env.NEXT_PUBLIC_PAGES_SIZE);
  const skipSize = pageSize * (Number(current_page) - 1);


  let resultListRows;
  if (locale == 'en') {
    resultListRows = await db.query(`
      select cr.*, ui.name as user_name, ui.image as user_avatar
            from chat_record cr
                LEFT JOIN user_info ui ON cr.user_id = ui.user_id
            where cr.is_public=$3 and cr.language not in ('zh')
            order by cr.created_at desc
                limit $1 offset $2
    `, [pageSize, skipSize, true]);
  } else {
    resultListRows = await db.query(`
      select cr.*, ui.name as user_name, ui.image as user_avatar
            from chat_record cr
                LEFT JOIN user_info ui ON cr.user_id = ui.user_id
            where cr.is_public=$3 and cr.language=$4
            order by cr.created_at desc
                limit $1 offset $2
    `, [pageSize, skipSize, true, locale]);
  }
  const results = resultListRows.rows;

  const resultInfoList = [];
  if (results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      const currentRow = results[i];
      resultInfoList.push(currentRow)
    }
    return resultInfoList;
  }
  return [];
}


export const getPagination = async (locale, current_page) => {

  const pageSize = Number(process.env.NEXT_PUBLIC_PAGES_SIZE);

  const {rows: results} = await db.query('select count(*) as total from chat_record where is_public=$1 and language=$2', [true, locale]);
  const total = results[0].total;
  const totalPage = Math.ceil(total / pageSize);

  const result = {
    totalPage: totalPage,
    pagination: createPagination(totalPage, Number(current_page), 6)
  }

  return result;
}

function createPagination(totalPages, currentPage, maxPagesToShow) {
  const pages = [];
  let startPage, endPage;

  if (totalPages <= maxPagesToShow) {
    // 总页数少于或等于最大显示页数，显示所有页码
    startPage = 1;
    endPage = totalPages;
  } else {
    // 确定页码的开始和结束位置
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      // 当前页码靠近开始
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
      // 当前页码靠近结束
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      // 当前页码在中间
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  // 生成页码
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}


export const getChatListByUserId = async (user_id: string, current_page:string) => {

  const pageSize = Number(process.env.NEXT_PUBLIC_PAGES_SIZE);
  const skipSize = pageSize * (Number(current_page) - 1);

  const {rows:works} = await db.query(`
    select chat_record.*, user_info.name as user_name, user_info.image as user_avatar
        from chat_record
            LEFT JOIN user_info ON chat_record.user_id = user_info.user_id
        where chat_record.user_id=$1 order by chat_record.updated_at desc limit $2 offset $3
  `, [user_id, pageSize, skipSize]);

  const resultInfoList = [];
  if (works.length > 0) {
    for (let i = 0; i < works.length; i++) {
      const currentRow = works[i];
      resultInfoList.push(currentRow)
    }
    return resultInfoList;
  }

  return [];
}
