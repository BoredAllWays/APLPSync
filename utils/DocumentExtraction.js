const { google } = require("googleapis");
const keys = require("../aplpsynckey.json");
const { documentId } = require("../config.json");

class DocumentExtraction {
    static _getAuthClient() {
        return new google.auth.JWT({
            email: keys.client_email,
            key: keys.private_key,
            scopes: ["https://www.googleapis.com/auth/documents.readonly"],
        });
    }

    static async getTabRecap(tabOffsetFromEnd = 2) {
        try {
            const auth = this._getAuthClient();
            const docs = google.docs({ version: "v1", auth });

            const response = await docs.documents.get({
                documentId: documentId,
                includeTabsContent: true,
            });

            return this._extractText(response, tabOffsetFromEnd);
        } catch (error) {
            console.error("Extraction Service Failure:", error.message);
            throw error;
        }
    }

    static _extractText(response, tabOffset) {
        let rawString = "";
        const tabs = response.data.tabs;

        if (!tabs || tabs.length < tabOffset) {
            throw new Error(
                `The document does not have enough tabs to look back by ${tabOffset}.`,
            );
        }

        const targetTab = tabs[tabs.length - tabOffset];
        const elements = targetTab.documentTab.body.content || [];
        const title = targetTab.tabProperties.title;

        rawString += `${title}: \n`;

        for (const element of elements) {
            if (element.paragraph && element.paragraph.elements) {
                for (const fragment of element.paragraph.elements) {
                    if (fragment.textRun && fragment.textRun.content) {
                        rawString += fragment.textRun.content;
                    }
                }
            }
        }
        return rawString;
    }
}

module.exports = DocumentExtraction;
