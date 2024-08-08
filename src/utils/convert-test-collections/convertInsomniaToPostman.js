const fs = require('fs');
const PostmanCollection = require('postman-collection');

// Util function to convert Insomnia JSON to Postman JSON
async function convertInsomniaToPostman(insomniaFilePath, postmanFilePath) {
    // Read the Insomnia export file
    const insomniaData = JSON.parse(fs.readFileSync(insomniaFilePath, 'utf8'));

    // Convert Insomnia data to Postman collection format
    const postmanCollection = convertToPostmanCollection(insomniaData);

    // Write the Postman collection to file
    fs.writeFileSync(postmanFilePath, JSON.stringify(postmanCollection.toJSON(), null, 2), 'utf8');
    console.log(`Postman collection has been written to ${postmanFilePath}`);
}

function convertToPostmanCollection(insomniaData) {
    // Initialize Postman Collection
    const postmanCollection = new PostmanCollection.Collection({
        info: {
            name: insomniaData.name || 'Insomnia Collection',
            description: insomniaData.description || 'Converted from Insomnia'
        },
        item: insomniaData.resources.map(resource => {
            return {
                name: resource.name,
                request: {
                    method: resource.method,
                    header: resource.headers?.map(header => ({
                        key: header.name,
                        value: header.value
                    })),
                    body: resource.body ? {
                        mode: resource.body.mode,
                        [resource.body.mode]: resource.body[resource.body.mode]
                    } : undefined,
                    url: {
                        raw: resource.url,
                        protocol: resource.url?.split('://')[0],
                        host: [resource.url?.split('://')[1].split('/')[0]],
                        path: resource.url?.split('://')[1].split('/').slice(1)
                    }
                }
            };
        })
    });

    return postmanCollection;
}

convertInsomniaToPostman("insomnia-export.json", "postman-out.json");
