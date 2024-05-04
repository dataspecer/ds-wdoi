# Download phase

Preprocessing is done using Wikidata `latest-all.json.gz` [dump](https://dumps.wikimedia.org/wikidatawiki/entities/).
We are using GZIP since it is much faster (~3x) to decompress, but it penalizes memory consumption, since it is larger file than the BZIP dump file. 

- It uses `requests` library.
- It handles connection errors by retrying from the last byte offset of the donwloaded file.
- There is a maximum number retries while extending waiting time before retrying.
- Running the main function will always overwrite the already existing dump.
- All the preprocessing methods working with the dump assume they get the GZIP dump file.