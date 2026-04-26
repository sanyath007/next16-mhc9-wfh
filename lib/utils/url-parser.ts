export const generateQueryString = (inputs: Record<string, string>) => {
    let queryStr = '';

    for (const [key, val] of Object.entries(inputs)) {
        queryStr += `&${key}=${val}`;
    }

    return queryStr;
};