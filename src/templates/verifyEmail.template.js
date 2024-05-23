const template = () => {
  return `
  <!DOCTYPE htmlPUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify email</title> 
      <style type="text/css">
        @import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");
  
        *,
        *::after,
        *::before {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
  
        .wrapper {
          width: 100%;
          table-layout: fixed;
          padding: 20px;
        }
  
        body {
          font-family: "Roboto", sans-serif;
          background-color: #d6d6d6;
        }
  
        .container {
          width: 35rem;
          background-color: #ffffff;
          border-radius: 10px;
          text-align: center;
          padding: 10px;
        }
  
        .title {
          font-size: 2rem;
          text-align: center;
        }
  
        .sub-title {
          text-align: center;
        }
  
        #verify-link {
          color: #f8f6e3;
          font-size: 1.5rem;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: all 0.2s linear;
          width: 80%;
          border-radius: 0.3rem;
          text-align: center;
          text-decoration: none;
          background-color: #7aa2e3;
          color: #f8f6e3;
          display: inline-block;
          height: 100%;
          padding: 10px;
        }
      </style>
    </head>
    <body>
      <center class="wrapper">
        <table class="container">
          <tr>
            <td colspan="4">
              <img
                width="70px"
                src="https://cdn-icons-png.flaticon.com/512/4616/4616091.png"
                alt=""
              />
            </td>
          </tr>
          <tr>
            <td colspan="4">
              <h1 class="title">Verify your email</h1>
            </td>
          </tr>
          <tr>
            <td colspan="4">
              <p class="sub-title">
                Link will expired after {{expiredMinutes}} minnutes
              </p>
            </td>
          </tr>
          <tr style="text-align: center">
            <td colspan="4" style="text-align: center">
              <a href="{{verifyLink}}" id="verify-link">Verify my email</a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 20px">
              <img
                width="40px"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"
                alt="facebook icon"
              />
            </td>
            <td style="padding-top: 20px">
              <img
                width="40px"
                src="https://static.vecteezy.com/system/resources/previews/027/395/710/non_2x/twitter-brand-new-logo-3-d-with-new-x-shaped-graphic-of-the-world-s-most-popular-social-media-free-png.png"
                alt="X_icon"
              />
            </td>
            <td style="padding-top: 20px">
              <img
                width="40px"
                src="https://cdn1.iconfinder.com/data/icons/logotypes/32/circle-linkedin-512.png"
                alt="linkedin icon"
              />
            </td>
            <td style="padding-top: 20px">
              <img
                width="40px"
                src="https://static.vecteezy.com/system/resources/previews/023/741/064/original/telegram-logo-icon-social-media-icon-free-png.png"
                alt="telegram-logo-icon-social-media-icon-free-png"
              />
            </td>
          </tr>
        </table>
      </center>
    </body>
  </html>
    `;
};

module.exports = template();
