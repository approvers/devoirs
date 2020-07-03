import { ApiClient } from './services/api/client';
import { ApiProxy } from './services/api/proxy';
import { SavedTokenProvider } from './services/token/provider/saved';
import { FilesystemTokenStorage } from './services/token-storage/filesystem';
import { Authorizer } from './services/authorizer';
import { ChromiumResolver } from './services/chromium/resolver';
import { ChromiumFinder } from './services/chromium/finder';
import { SortAssignments } from './sort';
import { createSortAssignments } from './sort';

const baseUrl = 'https://assignments.onenote.com/api/v1.0';

(async () => {
  const chromium = await new ChromiumFinder(__dirname).find();
  const resolver = new ChromiumResolver(chromium);
  const authorizer = new Authorizer(resolver);
  const tokenStorage = new FilesystemTokenStorage(process.cwd());
  const tokenProvider = new SavedTokenProvider(tokenStorage, authorizer);
  const proxy = new ApiProxy(baseUrl, tokenProvider);
  const client = new ApiClient(proxy);
  const assignments = await createSortAssignments(client);
  const readlineSync = require('readline-sync');
  
  const statusModes = ['Assigned','Completed','All'];
  let selectedStatus = readlineSync.keyInSelect(statusModes,'Please select the status of assignments.');
  const sortModes = ['Time','Class'];
  let selectedSort = readlineSync.keyInSelect(sortModes,'Please select a sorting method.');
  
  switch(sortModes[selectedSort]){
    case 'Time':
      assignments.sortCheck();
      assignments.sortClass();
      assignments.sortTime();
      break;

    case 'Class':
      assignments.sortTime();
      assignments.sortCheck();
      assignments.sortClass();
      break;

    default:
      break;
  }
  
  let classId:string;
  let className:string;
  
  for (const a of assignments.getAssignments()){
    if(classId !=a.classId){
      for (const c of await client.getClasses()) {
        if(a.classId == c.id){
          className = c.name;
          break;
        }
      }
    }

    switch(statusModes[selectedStatus]){
      case 'Assigned':
        if(!a['isCompleted']){
          if(className){
            console.log(`-`, className);
            className = null;
          }
          console.log('\t', '❗', a.dueDateTime, a.displayName);
        }
        break;

      case 'Completed':
        if(a['isCompleted']){
          if(className){
            console.log(`-`, className);
            className = null;
          }
          console.log('\t', '✔ ', a.dueDateTime, a.displayName);
        }
        break;

      case 'All':
        if(a){
          if(className){
            console.log(`-`, className);
            className = null;
          }
          console.log('\t', a['isCompleted'] ? '✔ ' : '❗', a.dueDateTime, a.displayName);
        }
        break;

      default:
        break;
    }
    classId = a.classId;
  }

  var keyHandler = readlineSync.question('Press Enter key.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
