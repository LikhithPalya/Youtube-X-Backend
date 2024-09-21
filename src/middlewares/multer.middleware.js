import multer from "multer"

//  IDEA IS TO BRING IT TO SERVER USING MULTER AND THEN MOVING IT OVER TO CLOUDINARY, SO MULTER ACTS LIKE A MIDDLEWARE

const storage = multer.diskStorage({ 
    //cb = callback
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ 
    storage, //storage:storage (since we use ES6)
  })  





  

// In Multer, the main difference between disk storage and memory storage is where the received files are stored:
// diskStorage: Writes the file directly to the file system.
// Memory storage: Temporarily saves the file in memory (RAM). 

// Here are some other differences between disk storage and memory storage:
// Use cases: Both options have different use cases, but you can use either way.
// Memory usage: Memory storage can use a lot of memory if you upload large files or large amounts of small files.
// Writing to file: To write the file from memory to, you need another module called 'fs'.