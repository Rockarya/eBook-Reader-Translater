# eBook Reader
This product is an advanced eBook platform that is capable of not only eBook reading, but also eBook translation. The product is a scalable web platform where users can search for and consume eBooks in multiple languages. Admin users have added functionalities, such as being able to upload, delete and translate books available on the platform.
 
# Backend

`server.js` -  
 
## routes

`User.js` - 
 
`Books.js` -
 
## models

`files.js` -
 
`Users.js` -
 
## public
 
### thumbs
 
Directory containing all the thumbnails of all the different books
 
### translation
 
Translation implemented here (documentation further down in the README)
 
# Frontend

## public

`index.html` - contains most of the basic things, along with background image taken from external URL, which u can see everytime u visit the website

## src
 
`App.js` - This file contains all the routes available.(/register route is commented temporarily as per requirement.)
 
`App.css` - CSS file for our app. This file is imported in App.js file.
 
### components
 
`Dashboard.js` - Home page of the platform where all users land on upon entering the site. Contains the book library where users may search for and view books. Search and Pagination have been implemented in the book library. Admin users have the added functionalities of being able to upload, delete and translate books.
 
`Login.js` - The code written under it lets the admin to log in to the platform, and give more functionalities like having a ‘delete’ button on the books and also uploading-translating the pdfs.
 
`Logout.js` - The code written under this will let an admin to log out of the system and become a normal user.
 
`NavigationBar.js` - Navigation bar is shown at the top of the website. It contains the Sign In/Sign Out options and also an ebook-reader tag along with logo, clicking on which takes you to the dashboard 
 
`viewpdf.js` - PDF viewer, users are redirected here after clicking the ‘view’ button next to a book. Has a lot of functionalities implemented for ease of viewing and changing up the viewing set up, such as zoom in, zoom out, fit to page, download, fullscreen, etc.
 
`App.css` - CSS file for the pdf viewer (this file is imported in viewpdf.js file)




# Documentation for PDF Translation

## Libraries Used

`pymupdf`

`fitz`

`pdfkit`

`wkhtmltopdf`

## Function Descriptions

`to_html()`: to_html uses pymupdf to parse the given PDF and create html files from it that store added information such as font size, font color, text location, and image location which are necessary for this translation module. It’s arguments are:

`filepath`: The path to the pdf file that is to be parsed. 

`book_id`: The id of the book that is being translated. Used to create a unique, temporary directory to store the parsed and translated html files until pdf reconstruction is completed (this argument is specific for the ebook reader application and is not necessary otherwise).

<br>

`get_trans()`: get_trans is responsible for the API call to translate a piece of text. get_trans requires an API key which is currently hardcoded in the function. It’s arguments are:

`text`: The text to be translated.

`init_lang`: The language of the given text. Must be in a 3-letter shortened form (Ex: eng, tel, hin).

`tar_lang`: The target language for the translation. Must be in a 3-letter shortened form (Ex: eng, tel, hin).

<br>

`sort_filelist()`: sort_filelist sorts a given filelist is they are of the format <filename>-<page number>.html. It sorts based on the page number at the end of the file names. It’s arguments are:

`filelist`: The list of files to be sorted.