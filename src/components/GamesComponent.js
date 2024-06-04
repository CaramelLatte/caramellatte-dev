import React from 'react';

function Games() {
    return (
        <div className='container'>
            <div className='content'>
                This is a control panel allow for remotely controlling a number of dedicated game servers. Consider this a functional demonstration rather than a completed project. More features and additional games will be added in the future.
                <br/><br/>
                Currently, use of this page is unrestricted. A login system will be added at a later date, to restrict access and allow for logging of user actions.
                <br/><br/>
                Using this page is simple. You may start or stop any of the servers by clicking the corresponding button. The status of the server will be updated in real time. Once the server you wish to use is online, you may connect to it in your game client using the provided IP address and port in the format "IP:PORT". Note that some games may not require specifying a port at all, in which case the base IP will be sufficient.
                <br/><br/>
                If you have any issues or want to see specific games added to this page, let me know.
            </div>
        </div>
    );
}

export default Games;