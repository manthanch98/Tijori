pragma solidity >=0.4.22 <0.9.0;

contract tijori{
    uint public fileCount=0;
    string public name= "Tijori";

    mapping(uint => File) public files;

    struct File{
        uint field;
        string fileHash;
        uint fileSize;
        string fileType;
        string fileName;
        string fileDescription;
        uint uploadTime;
        address payable uploader;
    }

    event fileUploaded(
        uint field,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName,
        string fileDescription,
        uint uploadTime,
        address payable uploader
    );

    constructor() public{

    }

    function uploadFile(string memory _fileHash,uint _fileSize,string memory _fileType,string memory _fileName,string memory _fileDesc) public {
        
        require(bytes(_fileHash).length>0);
        require(bytes(_fileType).length>0);
        require(bytes(_fileDesc).length>0);
        require(bytes(_fileName).length>0);
        require(msg.sender!=address(0));
        require(_fileSize>0);
        
        fileCount++;
        files[fileCount]= File(fileCount,_fileHash,_fileSize,_fileType,_fileName,_fileDesc,block.timestamp,payable(msg.sender));
        emit fileUploaded(fileCount, _fileHash, _fileSize, _fileType, _fileName, _fileDesc, block.timestamp,payable(msg.sender));

    }




}