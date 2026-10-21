const { google } = require('googleapis');

const documentId = process.env.DOCUMENT_ID;

class DocumentExtraction {
  static _getAuthClient() {
    return new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/documents.readonly']
    });
  }

  // Pass in how many recent tabs you want (defaults to 1 for the most recent meeting)
  static async getClosestTabs(numberOfTabs = 1) {
    try {
      const auth = this._getAuthClient();
      const docs = google.docs({ version: 'v1', auth });

      const response = await docs.documents.get({
        documentId: documentId,
        includeTabsContent: true
      });

      const tabs = response.data.tabs;
      if (!tabs || tabs.length === 0) {
        throw new Error('The document does not have any tabs.');
      }

      // 1. Find all tabs that have valid dates anywhere in the document
      const allDateTabs = this._findAllDateTabs(tabs);

      if (allDateTabs.length === 0) {
        return 'No date tabs found in the document.';
      }

      const currentDate = new Date();

      // 2. Filter out future dates so we only look at past/current meetings
      const pastTabs = allDateTabs.filter((item) => item.date <= currentDate);

      if (pastTabs.length === 0) {
        return 'No past meeting tabs found.';
      }

      // 3. Sort them in descending order (newest past date comes first)
      pastTabs.sort((a, b) => b.date - a.date);

      // 4. Take the top N most recent tabs
      const closestTabs = pastTabs.slice(0, numberOfTabs);

      // 5. Extract the text (including any subtabs they have)
      let finalOutput = '';
      for (const item of closestTabs) {
        finalOutput += this._extractTabTree(item.tab);
      }

      return finalOutput;
    } catch (error) {
      console.error('Extraction Service Failure:', error.message);
      throw error;
    }
  }

  // Helper 1: Recursively hunt down any tab that is named as a date
  static _findAllDateTabs(tabs) {
    let dateTabs = [];
    for (const tab of tabs) {
      const title = tab.tabProperties?.title || '';
      const tabDate = new Date(title);

      // If the title parses into a valid date, save it and its Date object
      if (!isNaN(tabDate)) {
        dateTabs.push({ tab: tab, date: tabDate });
      }

      // Check children too, in case dates are nested inside other folders
      if (tab.childTabs && tab.childTabs.length > 0) {
        dateTabs = dateTabs.concat(this._findAllDateTabs(tab.childTabs));
      }
    }
    return dateTabs;
  }

  // Helper 2: Extract text from a specific tab AND all of its subtabs
  static _extractTabTree(tab) {
    let rawString = '';
    const title = tab.tabProperties?.title || 'Untitled Tab';

    // Extract the main body content of this specific tab
    if (tab.documentTab?.body?.content) {
      rawString += `=== ${title} ===\n`;
      const elements = tab.documentTab.body.content;

      for (const element of elements) {
        if (element.paragraph && element.paragraph.elements) {
          for (const fragment of element.paragraph.elements) {
            if (fragment.textRun && fragment.textRun.content) {
              rawString += fragment.textRun.content;
            }
          }
        }
      }
      rawString += '\n\n';
    }

    // Recursively grab any subtabs sitting under this tab
    if (tab.childTabs && tab.childTabs.length > 0) {
      for (const child of tab.childTabs) {
        rawString += this._extractTabTree(child);
      }
    }

    return rawString;
  }
}

module.exports = DocumentExtraction;
