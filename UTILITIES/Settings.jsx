//@include 'json2.js';

/**
 * Returns "/" or "\\" based on the user's Operating System. Used for file paths.
 * @returns {String}
 */
function getSlashOS() {
  var system = $.os.substring(0, 3);
  var slash = "/";

  if (system === "Win") {
    slash = "\\";
  }

  return slash;
}

/**
 * Uses supplied folder and file name to pull settings from, or creates folder & file if they don't exist.
 * @param {string} folderName Name of folder
 * @param {string} fileName Name of file
 * @returns {File}
 */
function configSettingsFile(folderName, fileName) {
  var settingsFolderPath = Folder.myDocuments + getSlashOS() + folderName;
  var settingsFolder = new Folder(settingsFolderPath);
  if (!settingsFolder.exists) settingsFolder.create();
  var settingsFilePath = settingsFolder + getSlashOS() + fileName;
  return new File(settingsFilePath);
}

/**
 * Uses supplied folder and file name to pull settings from, or creates folder & file if they don't exist.
 * @param {String}  folderName Name of folder
 * @param {String}  fileName Name of file
 * @returns {File}
 */
function setupSettingsFile(folderName, fileName) {
  var slash = getSlashOS();
  var settingsFolderPath = Folder.myDocuments + slash + folderName;
  var settingsFolder = new Folder(settingsFolderPath);

  try {
    if (!settingsFolder.exists) {
      throw new Error("Settings folder doesn't exist." + "\n" + "Run 'CMT SEPS SETTINGS' and save your settings.");
    }

    var settingsFilePath = settingsFolder + slash + fileName;
    var settingsFile = new File(settingsFilePath);

    if (!settingsFile.exists) {
      throw new Error("Settings file doesn't exist." + "\n" + "Run 'CMT SEPS SETTINGS' and save your settings.");
    }

    return new File(settingsFilePath);
  } catch (e) {
    throw new Error(e.message);
  }
}

/**
 * Parses a JSON file and returns the data as an object.
 * @param {File}      file JSON file
 * @returns {Object}  Parsed JSON data
 */
function loadJSONData(file) {
  if (file.exists) {
    try {
      file.encoding = "UTF-8";
      file.open("r");
      var data = file.read();
      file.close();
      data = JSON.parse(data);
      return data;
    } catch (e) {
      throw new Error("Error loading Settings file.");
    }
  }
}

/**
 * Writes data to a JSON file.
 * @param {Object}  data Settings data object
 * @param {File}    file JSON file to write settings to
 */
function writeSettings(data, file) {
  try {
    file.encoding = "UTF-8";
    file.open("w");
    file.write(JSON.stringify(data));
    file.close();
  } catch (e) {
    ("Error saving Settings file.");
  }
}
