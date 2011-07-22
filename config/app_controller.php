<?php
/**
 * Application level Controller
 *
 * This file is application-wide controller file. You can put all
 * application-wide controller-related methods here.
 *
 * PHP versions 4 and 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright 2005-2010, Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2005-2010, Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       cake
 * @subpackage    cake.app
 * @since         CakePHP(tm) v 0.2.9
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

/**
 * Application Controller
 *
 * Add your application-wide methods in the class below, your controllers
 * will inherit them.
 *
 * @package       cake
 * @subpackage    cake.app
 */
class AppController extends Controller {
	
	var $SMTP_SERVER = 'smtp.zzz.com';
	var $SMTP_PORT = '25';
	var $SMTP_TIMEOUT = '30';
	var $SMTP_EMAIL = 'zzzzz_noreply@zzz.com';
	var $SMTP_USERNAME = 'zzzzz_noreply';
	var $SMTP_PASSWORD = 'zzzzzzzzzzzzzz';
	
	var $PAYPAL_APPLICATION_ID = 'APP-zzzzzzzzzzzzzzzzz';
	var $PAYPAL_API_EMAIL = 'zzzzz.zzzzzzz@zzzzz.com';
	var $PAYPAL_API_USERNAME = 'zzzzz.zzzzzzz_api1.zzzzz.com';
	var $PAYPAL_API_PASSWORD = 'zzzzzzzzzzzzzzzz';
	var $PAYPAL_API_SIGNATURE = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';
	var $PAYPAL_API_ENDPOINT = 'https://svcs.paypal.com/';
	var $PAYPAL_REDIRECT_URL = 'https://www.paypal.com/webscr&cmd=';

	var $RESET_PASSWORD_LINK = 'http://www.zzzzzzz.org/~zzzzz/zzzzzzzzzzz/cturk/client/resetPassword.html';
	var $PAY_RETURN_LINK = 'http://www.zzzzzzz.org/~zzzzz/zzzzzzzzzzz/cturk/client/requester/index.html';
	
	var $AJAX_RETURN_TYPE = 'JSON';
	var $CURRENCY_CODE = 'GBP'; //USD, GBP, EUR, JPY, CAD, AUD
	

	var $uses = array ('User', 'Group', 'Hit', 'Assignment' );
	
	public function getCurrentTimeStamp() {
		return ceil ( microtime ( true ) * 1000 );
	}
	
	/**
	 * refresh hit state(autoExpire, autoApprove)
	 */
	protected function refreshHIT() {
		$now = $this->getCurrentTimeStamp ();
		
		//update table [assignment], [hit]
		$assignmentData = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.expireDate <=' => $now, //
'Assignment.state' => 'Accepted' ), //
'recursive' => - 1 ) );
		foreach ( $assignmentData as $assignment ) {
			$assignmentId = $assignment ['Assignment'] ['id'];
			$hitId = $assignment ['Assignment'] ['hit_id'];
			
			//[assignment] state='Expired'
			$this->Assignment->id = $assignmentId;
			$this->Assignment->saveField ( 'state', 'Expired' );
			
			//[hit] state='Published' OR 'Expired'
			$this->Hit->id = $hitId;
			$this->Hit->saveField ( 'state', 'Published' );
		}
		
		//update table [hit]
		$hitData = $this->Hit->find ( 'all', array (//
'conditions' => array (//
'Hit.expireDate <=' => $now, //
'Hit.state' => 'Published' ), //
'recursive' => - 1 ) );
		foreach ( $hitData as $hit ) {
			$hitId = $hit ['Hit'] ['id'];
			$assignmentCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.hit_id' => $hitId, //
'state' => array ('Accepted', 'Submitted', 'Approved', 'Close' ) ), //
'recursive' => - 1 ) );
			if ($assignmentCount == 0) {
				$this->Hit->id = $hitId;
				$this->Hit->saveField ( 'state', 'Expired' );
			}
		}
		
		//update table [group] numAvailableHit, state
		$groupData = $this->Group->find ( 'all', array (//
'recursive' => - 1 ) );
		foreach ( $groupData as $group ) {
			$groupId = $group ['Group'] ['id'];
			$numAvailableHit = $this->Hit->find ( 'count', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.state' => 'Published' ), //
'recursive' => - 1 ) );
			
			$numActiveHit = $this->Hit->find ( 'count', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.state' => array ('Published', 'Locked' ) ), //
'recursive' => - 1 ) );
			$state = "Active";
			if ($numActiveHit == 0) { //state='Inactive'
				$state = "Inactive";
			}
			$this->Group->id = $groupId;
			$this->Group->saveField ( 'numAvailableHit', $numAvailableHit );
			$this->Group->saveField ( 'state', $state );
		}
		
		// autoApprove
		// update table [assignment]
		$lockedAssignment = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Hit.state' => 'Locked', //
'Assignment.state' => 'Submitted' ), //
'recursive' => 1 ) );
		if ($lockedAssignment) {
			foreach ( $lockedAssignment as $la ) {
				if ($la ['Assignment']) {
					$acceptDate = $la ['Assignment'] ['acceptDate'];
					$autoApproveDate = $acceptDate + $la ['Hit'] ['autoApprovalTime'] * 1000;
					if ($autoApproveDate <= $now) { //autoApprove
						$this->Assignment->id = $la ['Assignment'] ['id'];
						$this->Assignment->saveField ( 'state', 'Approved' );
						//update [user] acceptanceRatio
						$workerId = $la ['Assignment'] ['worker_id'];
						$this->updateUserAcceptanceRatio ( $workerId );
					}
				}
			}
		}
	}
	
	/**
	 * update  [user] acceptanceRatio
	 * [user] acceptanceRatio = num(approved assignments) / num(submitted assignments)
	 * @param int $workerId
	 */
	private function updateUserAcceptanceRatio($workerId) {
		$numApprovedAssignment = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.worker_id' => $workerId, //
'state' => array ('Approved', 'Closed' ) ), //
'recursive' => - 1 ) );
		
		$numSubmittedAssignment = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.worker_id' => $workerId, //
'Assignment.state' => array ('Submitted', 'Approved', 'Closed', 'Rejected' ) ), //
'recursive' => - 1 ) );
		$acceptanceRatio = round ( 100 * $numApprovedAssignment / $numSubmittedAssignment );
		
		$this->User->id = $workerId;
		$this->User->saveField ( 'acceptanceRatio', $acceptanceRatio );
	}
	
	/**
	 * assert user has logged in
	 */
	protected function isLoginUser() {
		return $this->Session->check ( "userId" ) && $this->Session->check ( "username" );
	}
	
	/**
	 * assert user is worker
	 */
	protected function isWorker() {
		return $this->Session->read ( "isWorker" ) == 1;
	}
	
	/**
	 * assert user can accept HIT
	 */
	protected function isEnabledWorker() {
		return $this->Session->read ( "isEnabled" ) == 1;
	}
	
	/**
	 * assert user is requester
	 */
	protected function isRequester() {
		return $this->Session->read ( "isRequester" ) == 1;
	}
}
