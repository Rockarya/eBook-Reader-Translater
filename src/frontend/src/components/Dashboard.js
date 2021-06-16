import React, { Component, useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import axios from "axios";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Box from '@material-ui/core/Box';
import CameraIcon from "@material-ui/icons/PhotoCamera";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import Pagination from '@material-ui/lab/Pagination';
// Imports for upload
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { FileDrop } from "react-file-drop";
import "./dragdrop.css";
import { StyledDropZone } from 'react-drop-zone'
import 'react-drop-zone/dist/styles.css'
import SearchField from "react-search-field";
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "100%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  pagination: {
    float: 'right'
  },
}));

var uploadedfiles = null;

export default function Dashboard() {
  const [popupflag, setPopup] = useState(false);
  const [title, setTitle] = useState();
  const [author, setAuthor] = useState();
  const [langs, setLangs] = useState([]);
  // booksInfo contains all books present in the books library
  const [booksInfo, setBooksInfo] = useState([]);
  // dispBooksInfo contains all possible books that we can display for the current search result
  const [dispBooksInfo, setDispBooksInfo] = useState([]);
  // pageBooksInfo contains all the books that are currently being displayed on the page (maximum of 6, pagination)
  const [pageBooksInfo, setPageBooksInfo] = useState([]);
  const [page, setPage] = useState(1);
  const pagination_number = 6;
  const [langSelectTitle, setLangSelectTitle] = useState('Select Language');
  const [isAdmin, setAdmin] = useState(false)

  
  // when book is dropped/dragged, then this function will be called to upload the book  (Admin only)
  const uploadBook = () => {
    const formData = new FormData();
    console.log(uploadedfiles);    
    formData.append('file', uploadedfiles);
    formData.append('title', title);
    formData.append('author_name', author);
    formData.append('language', langs);

    axios
      .post("http://localhost:4000/user/upload/", formData)
      .then((res) => {
        console.log(res.data);
        alert(res.data.msg);
        window.location.reload()
      })
      .catch((err) => {
        console.log(err);
      });

    setTitle("");
    setAuthor("");
    setLangs([]);
    setPopup(false);
  };

  // if cancelling the upload, then resetting everything
  const cancelUpload = () => {
    setTitle("");
    setAuthor("");
    setLangs([]);
    setPopup(false);
  };

  // this function will be called when the user clicks the delete btn on the book (Admin only)
  const deleteBook = (index) => {
      axios.delete('http://localhost:4000/book/deleteBook?filename=' + pageBooksInfo[index].file_name).then(() => {
      alert("Book Deleted Successfully!");
        window.location.reload();
      }).catch(err => {
        console.log(err);
        alert("Could not delete file");
      });
  }

  // this function will be called when the user clicks view button on the book (both the normal and admin user)
  const viewBook = index => {
    window.location = '/viewBook' + '?' + 'book_name=' + pageBooksInfo[index].file_name;
  };

  // drop-down functionality
  const langSelect = (lang) => {
    setLangs(lang);
    setLangSelectTitle('Language Selected: ' + lang);
    var searchBooks = []
    for (var i = 0; i < booksInfo.length; i++) {
      var flag = 0
      if (!(booksInfo[i].language && booksInfo[i].file_name)) {
        flag = 1
      }
      if(flag == 0)
      {
        if(lang != 'None')
        {
          if(booksInfo[i].language == lang)
          {
            searchBooks.push(booksInfo[i])
          }
        }
        else
        {
          searchBooks.push(booksInfo[i])
        }
      }
    }
    setPage(1)
    setDispBooksInfo(searchBooks)
    handleChange(1, searchBooks)
  }


  const handleChange = (value, books = dispBooksInfo) => {
    setPageBooksInfo(books.slice(pagination_number * (value - 1), pagination_number * (value)));
  };

  // this function is called when the user presses the search button, searching by author and title name, updating the books being displayed (both the normal and admin user)
  const onSearchClickExample = (value) => {
    var searchBooks = []
    for (var i = 0; i < booksInfo.length; i++) {
      var flag = 0
      if (!(booksInfo[i].title && booksInfo[i].author_name && booksInfo[i].file_name)) {
        flag = 1
      }
      var str1 = value.toLowerCase()
      var str2 = booksInfo[i].title.toLowerCase()
      var str3 = booksInfo[i].author_name.toLowerCase()
      console.log(str1, str2, str3)
      if ((flag == 0) && (str2.includes(str1) || str3.includes(str1))) {
        searchBooks.push(booksInfo[i])
      }
    }
    setPage(1)
    setDispBooksInfo(searchBooks)
    handleChange(1, searchBooks)
  }

  useEffect(() => {
    // API request to get all books from the book library
    axios.get("http://localhost:4000/user/allbooks")
      .then((res) => {
        setBooksInfo(res.data)
        setDispBooksInfo(res.data)
        handleChange(page)
        setPageBooksInfo(res.data.slice(pagination_number * (page - 1), pagination_number * (page)));
      })
      .catch((err) => {
        console.log(err);
      });
      // API request checking whether the user is logged in or not
      axios
      .get("http://localhost:4000/user/legit", { withCredentials: true })
      .then((res) => {
        if (!res.data) {
          // window.location = '/login';
        } else {
          // console.log(document.cookie + "this cookie");
          setAdmin(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [])

  const classes = useStyles();

  return (
    <Container>
      {pageBooksInfo[0] ?
        <div>
          <AppBar position="relative">
            {
              <SearchField
                placeholder="Search by Author/Title"
                onSearchClick={onSearchClickExample}
                font-color='black'
              />
            }
          </AppBar>
          
          {/* DROP-DOWN MENU */}
          <div className="App container">
            <DropdownButton onSelect={langSelect} align="Center" title={langSelectTitle} variant="info" size='lg' padding='5' id="dropdown-language">
              <Dropdown.Item eventKey="English">English</Dropdown.Item>
              <Dropdown.Item eventKey="Hindi">Hindi</Dropdown.Item>
              <Dropdown.Item eventKey="Telugu">Telugu</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="None">None</Dropdown.Item>
            </DropdownButton>
          </div>


          {/* Book Displaying */}
          <Container className={classes.cardGrid} maxWidth="md">
            {/* End hero unit */}
            <Grid container spacing={4}>
              {pageBooksInfo.map((card, ind) => (
                <Grid item key={card._id} xs={10} sm={4} md={4}>
                  <Card className={classes.card}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={"http://localhost:4000/user/thumbnail?filename=" + pageBooksInfo[ind].file_path}
                      title={pageBooksInfo[ind].title}
                    />
                    <CardContent className={classes.cardContent}>

                      <Typography>
                        Title: {pageBooksInfo[ind].title}
                      </Typography>
                      <Typography>
                        Author: {pageBooksInfo[ind].author_name}
                      </Typography>
                      <Typography>
                        Language: {pageBooksInfo[ind].language}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="secondary" onClick={() => { viewBook(ind) }}>
                        View
                    </Button >
                      {isAdmin ?
                        <Button size="small" color="primary" onClick={() => {deleteBook(ind)}}>
                          Delete
                    </Button >
                        : false
                      }
                    </CardActions>
                  </Card>
                </Grid>
              ))}

            </Grid>
            {/* Pagination */}
            <div className={classes.pagination}>
              {/* <Typography>Page: {page}</Typography> */}
              {dispBooksInfo.length ?
                <Pagination count={Math.ceil(dispBooksInfo.length / pagination_number)} page={page} onChange={(event, value) => {
                  setPage(value)
                  handleChange(value)
                }
                } /> : <>HENLO</>}
            </div>
          </Container>
          {/* Added admin functionalities */}
          {isAdmin ?
            <footer className={classes.footer}>
              <div>
                {popupflag ? (
                  <>
                  {/* Upload book form */}
                    <form onSubmit={uploadBook}>
                      <div className="form-group">
                        <label>Title: </label>
                        <input
                          type="text"
                          className="form-control"
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Author: </label>
                        <input
                          type="text"
                          className="form-control"
                          onChange={(e) => setAuthor(e.target.value)}
                          required
                        />
                      </div>
                      <Autocomplete
                        freeSolo
                        multiple
                        id="combo-box-demo"
                        options={["Telugu", "Hindi"].map((option) => option)}
                        getOptionLabel={(option) => option}
                        onChange={(event, newValue) => {
                          setLangs(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Translation Languages"
                            variant="outlined"
                          />
                        )}
                      />
                      <div className="form-group">
                        <input
                          type="submit"
                          value="Upload"
                          className="btn btn-primary"
                        />
                      </div>
                    </form>
                    <form onSubmit={cancelUpload}>
                      <div className="form-group">
                        <input
                          type="submit"
                          value="Cancel"
                          className="btn btn-secondary"
                        />
                      </div>
                    </form>
                  </>
                ) : (
                    <>
                    {/* Book upload drag and drop */}
                      <StyledDropZone
                        onDrop={(file, event) => {
                          uploadedfiles = file;
                          alert("Book selected\n\nPlease fill in the details below");
                          setPopup(true);
                        }}
                      />
                    </>
                  )}
              </div>
              <Copyright />
            </footer>
            : false
          }
        </div>
        : <>Loading...</>}
    </Container>
  )
}