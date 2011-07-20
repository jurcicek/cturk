<?php
class UsersController extends AppController {
	
	var $name = 'Users';
	
	var $autoRender = false;
	
	var $components = array ('Ajax', 'Email' );
	
	public function index($p1 = null) {
		echo '<pre>';
		print_r ( $p1 );
		echo "<br><br>";
		print_r ( $_GET );
		echo "<br><br>";
		print_r ( $this->params );
		echo '</pre>';
	}
	
	/**
	 * log out
	 */
	public function logout() {
		$this->Session->destroy ();
		$this->Ajax->success ( 'Logout success.' );
	}
	
	/**
	 * register a user, all registered user is worker by default
	 */
	public function register() {
		//$this->params['form']
		//$this->params['pass']
		$info = '';
		$status = 0;
		$data = $this->params ['form'];
		if (! empty ( $data )) {
			unset ( $data ['id'] );
			$data ['password'] = md5 ( $data ['password'] );
			$data ['email'] = $data ['username'];
			$data ['isRequester'] = 0;
			$data ['isActive'] = 1;
			$data ['isEnabled'] = 1;
			$data ['acceptanceRatio'] = 0;
			$data ['createDate'] = $this->getCurrentTimeStamp ();
			$this->User->create ( $data );
			if ($this->User->save ( $data )) {
				$info = 'Register success.';
				$status = 1;
			
			} else {
				$info = 'Register error, please change username and try again.';
			}
		} else {
			$info = 'Data cannot be empty.';
		}
		$this->Ajax->ajaxReturn ( '', $info, $status );
	}
	
	/**
	 * edit user's info
	 */
	public function updateInfo() {
		if ($this->isLoginUser ()) {
			$userId = $this->Session->read ( "userId" );
			
			$d = $this->params ['form'];
			//paypalAccount, title, firstname, surname, 
			//sex, buildingName, streetName, cityName, postcode
			$userData = array ();
			$userData ['id'] = $userId;
			$userData ['paypalAccount'] = $d ['paypalAccount'];
			$userData ['title'] = $d ['title'];
			$userData ['firstname'] = $d ['firstname'];
			$userData ['surname'] = $d ['surname'];
			$userData ['sex'] = $d ['sex'];
			$userData ['buildingName'] = $d ['buildingName'];
			$userData ['streetName'] = $d ['streetName'];
			$userData ['cityName'] = $d ['cityName'];
			$userData ['postcode'] = $d ['postcode'];
			
			$data = array ('User' => $userData );
			//$this->User->create ( $data );
			if (false !== $this->User->save ( $data )) {
				$this->Ajax->ajaxReturn ( $data, 'Update success.', 1 );
			} else {
				$this->Ajax->error ( 'Update error.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid user.' );
		}
	}
	
	/**
	 * change password
	 */
	public function updatePassword() {
		if ($this->isLoginUser ()) {
			$userId = $this->Session->read ( "userId" );
			
			$d = $this->params ['form'];
			if (! isset ( $d ['oldPassword'] ) || $d ['oldPassword'] == "") {
				$this->Ajax->error ( 'OldPassword cannot be empty.' );
				die ();
			}
			if (! isset ( $d ['newPassword'] ) || $d ['newPassword'] == "") {
				$this->Ajax->error ( 'NewPassword cannot be empty.' );
				die ();
			}
			
			$conditions = array (//
"User.id" => $userId, //
"User.password" => md5 ( $d ['oldPassword'] ) );
			$isValidUser = $this->User->find ( 'first', array (//
'conditions' => $conditions, //
'recursive' => - 1 ) );
			if ($isValidUser) {
				$userData = array ();
				$userData ['id'] = $userId;
				$userData ['password'] = md5 ( $d ['newPassword'] );
				$data = array ('User' => $userData );
				$this->User->create ( $data );
				if (false !== $this->User->save ( $data, false )) {
					$this->Ajax->ajaxReturn ( $data, 'Update success.', 1 );
				} else {
					$this->Ajax->error ( 'Update error.' );
				}
			
			} else {
				$this->Ajax->error ( 'OldPassword error.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid user.' );
		}
	}
	
	/**
	 * get user's info
	 */
	private function getCurrentUser() {
		if ($this->isLoginUser ()) {
			$userId = $this->Session->read ( "userId" );
			$data = $this->User->find ( 'first', array (//
'conditions' => array ('User.id' => $userId ), //
'recursive' => - 1 ) );
			if ($data) {
				$this->Ajax->ajaxReturn ( $data, 'Get info success.', 1 );
			
			} else {
				$this->Ajax->error ( 'No data.' );
			}
		} else {
			$this->Ajax->error ( 'Please login.' );
		}
	}
	
	/**
	 * get user's info given userId
	 * @param int $userId
	 */
	public function info($userId = null) {
		if ($this->isLoginUser ()) {
			if (empty ( $userId ) || $this->isRequester ()) {
				if (empty ( $userId )) {
					$userId = $this->Session->read ( "userId" );
				}
				$data = $this->User->find ( 'first', array (//
'conditions' => array ('User.id' => $userId ), //
'recursive' => - 1 ) );
				if ($data) {
					$this->Ajax->ajaxReturn ( $data, 'Get info success.', 1 );
				
				} else {
					$this->Ajax->error ( 'No data' );
				}
			} else {
				$this->Ajax->error ( 'Permission required.' );
			}
		
		} else {
			$this->Ajax->error ( 'Please login.' );
		}
	}
	
	/**
	 * get link to reset the password
	 */
	public function getResetPassword() {
		$username = $this->params ['form'] ['username'];
		if (! $username) {
			$this->Ajax->error ( 'Email cannot be empty.', true );
			exit ();
		}
		
		$data = $this->User->find ( 'first', array (//
'conditions' => array ('User.username' => $username ), //
'recursive' => - 1 ) );
		if (! $data) {
			$this->Ajax->error ( 'No such user.' );
			exit ();
		}
		
		$userId = $data ['User'] ['id'];
		$resetPasswordToken = md5 ( $userId . $this->getCurrentTimeStamp () );
		
		$usertokenData = array (//
'user_id' => $userId, //
'resetPasswordToken' => $resetPasswordToken, //
'hasUsed' => 0 );
		$this->User->Usertoken->create ( $usertokenData );
		$this->User->Usertoken->save ( array (//
'Usertoken' => $usertokenData ) );
		
		$html = '';
		$html .= 'Click&nbsp;<a href="' . $this->RESET_PASSWORD_LINK . '?token=' . $resetPasswordToken . '">HERE</a>&nbsp;to reset your password.<br />';
		$html .= 'Your reset password token: ' . $resetPasswordToken;
		
		$this->Email->smtpOptions = array (//
'port' => $this->SMTP_PORT, //
'timeout' => $this->SMTP_TIMEOUT, //
'auth' => true, //
'host' => $this->SMTP_SERVER, //
'username' => $this->SMTP_USERNAME, //
'password' => $this->SMTP_PASSWORD );
		$this->Email->delivery = 'smtp';
		$this->Email->from = $this->SMTP_EMAIL;
		$this->Email->to = $username;
		$this->Email->sendAs = 'html';
		$this->Email->subject = 'CTURK reset your password';
		$this->Email->send ( $html );
		
		if (true) {
			$this->Ajax->success ( 'Send mail success, please check your Email.' );
		} else {
			$this->Ajax->error ( 'Send mail error, please try again later, or contact with administrator.' );
		}
	}
	
	/**
	 * reset user's password
	 * POST token password
	 */
	public function resetPassword() {
		$token = $this->params ['form'] ['token'];
		$password = $this->params ['form'] ['password'];
		if (! $token || ! $password) {
			$this->Ajax->error ( 'Invalid parameter.' );
			exit ();
		}
		
		$data = $this->User->Usertoken->find ( 'first', array (//
'conditions' => array (//
'Usertoken.resetPasswordToken' => $token, //
'Usertoken.hasUsed' => 0 ), //
'recursive' => 0 ) );
		if ($data) {
			//print_r ( $data );
			$userId = $data ['User'] ['id'];
			$tokenId = $data ['Usertoken'] ['id'];
			$this->User->Usertoken->save ( array (//
'id' => $tokenId, //
'hasUsed' => 1 ) );
			$result = $this->User->save ( array (//
'id' => $userId, //
'password' => md5 ( $password ) ) );
			if ($result) {
				$this->Ajax->success ( 'Update user password success.' );
			} else {
				$this->Ajax->error ( 'Update user password error.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid token.' );
		}
	}
}
?>