# codesignal-cloudstorage  

# Level 2
Implement support for retrieving file names by searching directories via prefixes and suffixes.

    findFile(prefix, suffix) — should search for files with names starting with prefix and ending with suffix. Returns a list of strings representing all matching files in this format: ["<name1>(<size1>)", "<name2>(<size2>)", ...]. The output should be sorted in descending order of file sizes or, in the case of ties, lexicographically. If no files match the required properties, should return an empty list.  

# Level 3  
Implement support for different users sending queries to the system. All users share a common filesystem in the cloud storage, but each user is assigned an individual storage capacity limit.

    addUser(userId, capacity) — should add a new user to the system, with capacity as their storage limit in bytes. The total size of all files owned by userId cannot exceed capacity. The operation fails if a user with userId already exists. Returns true if a user with userId is successfully created, or false otherwise.

    addFileBy(userId, name, size) — should behave in the same way as the addFile from Level 1, but the added file should be owned by the user with userId. A new file cannot be added to the storage if doing so will exceed the user's capacity limit. Returns the remaining storage capacity for userId if the file is successfully added or null otherwise.

Note that all queries calling the addFile operation implemented during Level 1 are run by the user with userId = "admin", who has unlimited storage capacity. Also, assume that the copyFile operation preserves the ownership of the original file.

    updateCapacity(userId, capacity) — should change the maximum storage capacity for the user with userId. If the total size of all user's files exceeds the new capacity, the largest files (sorted lexicographically in case of a tie) should be removed from the storage until the total size of all remaining files will no longer exceed the new capacity. Returns the number of removed files, or null if a user with userId does not exist.  

# Level 4  
Implement in support for file compression.

    compressFile(userId, name) — should compress the file name if it belongs to userId. The compressed file should be replaced with a new file named <name>.COMPRESSED. The size of the newly created file should be equal to the half of the original file. The size of all files is guaranteed to be even, so there should be no fractional calculations. It is also guaranteed that name for this operation never points to a compressed file - i.e., it never ends with .COMPRESSED. Compressed files should be owned by userId — the owner of the original file. Returns the remaining storage capacity for userId if the file was compressed successfully or null otherwise.

Note that because file names can only contain lowercase letters, compressed files cannot be added via addFile.
It is guaranteed that all copyFile operations will preserve the suffix .COMPRESSED.

    decompressFile(userId, name) — should revert the compression of the file name if it belongs to userId. It is guaranteed that name for this operation always ends with .COMPRESSED. If decompression results in the userId exceeding their storage capacity limit or a decompressed version of the file with the given name already exists, the operation fails. Returns the remaining capacity of userId if the file was decompressed successfully or null otherwise.
