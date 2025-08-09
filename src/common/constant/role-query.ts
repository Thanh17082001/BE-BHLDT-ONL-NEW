// export const queryTeacher = (table) => `${table}.id IN (:...subjectIds) OR (school.isAdmin = :isAdmin AND school.schoolType IN (:...schoolTypesQuery)) OR ${table}.created_by =:created_by` x
// em đc cả các record mà do tài khoản admin tạo ra

export const queryTeacher = (table) => `${table}.id IN (:...subjectIds) OR ${table}.created_by =:created_by`
export const roleQueryPrincipal = '(school.id = :schoolId OR (school.isAdmin = :isAdmin AND school.schoolType IN (:...schoolTypesQuery)))'