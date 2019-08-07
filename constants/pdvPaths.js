const PDV_PATHS = {
    // APIs with no auth
    GET_DETAILS: "/",
    RUN_BROWSER: "/public/browser",

    // Add a new profile
    ADD_PROFILE: "/profiles",
    GET_PROFILES: (profileId = "", cred = false) => `/profiles/${profileId}${cred ? "/credential" : ""}`,
    DELETE_PROFILE: (profileId) => `/profiles/${profileId}`,

    // Open a browser and login
    LOGIN_AND_ADD_PROFILE: "/profiles/login",
    LOGIN_PROFILE: (profileId) => `/profiles/${profileId}/login`,

    // Add a new basic profile
    ADD_BASIC_PROFILE: "/profiles/basic",

    // Generic APIs to get and resume processes
    GET_PROCESS: (pid) => `/processes/${pid}`,
    RESUME_PROCESS: (pid) => `/processes/${pid}`,
    STOP_PROCESS: (pid) => `/ota/process/${pid}`,

    // Get accounts and transactions
    GET_ACCOUNTS: (accountId = "", profileId = "", accountType = "") => `/accounts/${accountId}?` + (profileId ? `&profileId=${profileId}` : "") + (accountType ? `&accountType=${accountType}` : ""),
    GET_TRANSACTIONS: (transactionId = "", startDate = "", endDate = "", profileId = "", accountId = "") => `/transactions/${transactionId}?` + (startDate ? `&startDate=${startDate}` : "") + (endDate ? `&endDate=${endDate}` : "") + (profileId ? `&profileId=${profileId}` : "") + (accountId ? `&accountId=${accountId}` : ""),

    // APIs for OTA
    GET_INSTITUTIONS: (instCode = "") => `/ota/institutions/${instCode}`,
    START_OTA: "/ota/process",
    QUERY_OTA: (pid, csrf = "") => `/ota/process/${pid}?challenge=${csrf}`,
    RESUME_OTA: (pid = "") => `/ota/process/${pid}`,
    STOP_OTA: (pid, csrf = "") => `/ota/process/${pid}?challenge=${csrf}`,

    // Update a profile
    UPDATE_PROFILE: (profileId) => `/profiles/${profileId}`,

    // Update a basic profile
    UPDATE_BASIC_PROFILE: (profileId) => `/profiles/${profileId}/basic`,

    // Check for updates
    CHECK_FOR_UPDATES: (updateSite) => `/public/updates/check?site=${updateSite}`,

    // Download updates
    DOWNLOAD_UPDATES: "/public/updates/download",

    // Download update process
    DOWNLOAD_UPDATE_PROCESS: "/public/updates/process",
    
    // Apply updates
    APPLY_UPDATES: "/public/updates/apply"
};

module.exports = PDV_PATHS;