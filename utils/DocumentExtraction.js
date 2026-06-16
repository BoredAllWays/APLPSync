const { google } = require("googleapis");

const documentId = process.env.DOCUMENT_ID;
class DocumentExtraction {
    static _getAuthClient() {
        return new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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
