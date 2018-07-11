var requestProgress = {

};

// var startTime = 0;

module.exports = (reporter,definition) =>{

  reporter.initializeListeners.add('request-progress',function() {

    if(!!reporter.options.express && !reporter.options.express.socketIO){
      const socketUrl = reporter.options.express.socketUrl;
      const socketClient = require('socket.io-client')(socketUrl);
      socketClient.io.on('connect_error', error => {
        // logger.error(error);
        console.log('++jsreport++++connect_error  ',error);
      });
      socketClient.on('reconnect_error', error => {
        // logger.error(error);
        console.log('++++++++++jsreport++++reconnect_error  ',reconnect_error);
      });
      socketClient.on('reconnect_failed', () => {
        // logger.error('SocketIO client: failed to reconnect');
        console.log('++++++++++jsreport++++reconnect_failed ',reconnect_failed);
      });
      socketClient.on('error', error => {
        // logger.error(error);
        console.log('++++++++++jsreport++++ error ',error);
      });
      socketClient.on('connect', function(){
        console.log('++++++++++jsreport++++ connect ');
      });

      reporter.options.express.socketIO = function(){
        return socketClient;
      }
    }

    reporter.beforeRenderListeners.insert(0,'request-progress',function(request,response){
      console.log(' reporter.beforeRenderListeners  request.data.dataset.countViews ' + request.data.dataset.countViews +' +++++++++++++++' );
      console.log(' reporter.beforeRenderListeners  request.data.reportStartTime ' + request.data.reportStartTime +' +++++++++++++++' );

      if(!request.options.isChildRequest) {

      }
      if(!request.options.isChildRequest){
        request.options.parentId = request.id;
        // startTime = Date.now();
        request.data.reportStartTime = request.data.reportStartTime || Date.now();
        request.data.dataset.countViews = request.data.dataset.countViews || 0;
        request.data.dataset.totalViews = request.data.dataset.countViews + 3; // header footer content

      }

      // keep track of request progress
      requestProgress[request.options.parentId||request.id] = request.progresses = requestProgress[request.options.parentId||request.id] || [];

      // do I need rewriters ?

      //push the progress to client
      if(reporter.options.express && reporter.options.express.socketIO){
        reporter.options.express.socketIO().emit('sendPdfToUser', { userId: 'xxxx-test-xxxx-xxxx', eventType: 'progress test', payload: {curTime:'11ms',progress:20}, consid: 'xxxx.xx.x.x.' });
      }

      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest || false,
        costTime:Date.now() - request.data.reportStartTime,
        progress:0,
        message:'Starting rendering request ' + request.id
      });

      //
    });

    reporter.afterRenderListeners.add('request-progress',function(request,response){
      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest || false,
        costTime:Date.now() - request.data.reportStartTime,
        progress:0,
        message:'Rendering request finished ' + request.id
      });

      response.progresses = request.progresses; // we may need it to store the progress info.


    });

    reporter.renderErrorListeners.add('request-progress',function(request,response,e){
      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest || false,
        costTime:Date.now() - request.data.reportStartTime,
        progress:0,
        message:'Rendering error  ' + request.id
      });
    });
    reporter.afterTemplatingEnginesExecutedListeners.add('request-progress',function(request,response){
      request.progresses.push({
        timestamp:new Date(),
        timenow:Date.now(),
        isChildRequest:request.options.isChildRequest || false,
        costTime:Date.now() - request.data.reportStartTime,
        progress:0,
        message:'Tempating Engines Executed  ' + request.id
      });
    });
  });
}
