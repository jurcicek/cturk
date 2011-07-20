<?php
class RequestersController extends AppController {
	
	var $name = 'Users';
	
	var $autoRender = false;
	
	var $components = array ('Ajax', 'Paypal' );
	
	var $uses = array ('User', 'Group', 'Hit', 'Assignment', 'Payorder', 'Workerrequest' );
	
	/**
	 * requester login
	 */
	public function login() {
		$data = $this->params ['form'];
		if ($data && $data ['username'] && $data ['password']) {
			$username = $data ['username'];
			$password = md5 ( $data ['password'] );
			$conditions = array (//
"User.username" => $username, //
"User.password" => $password );
			$data = $this->User->find ( 'first', array (//
'conditions' => $conditions, //
'recursive' => - 1 ) );
			if ($data) {
				if ($data ['User'] ['isActive'] == 1) {
					if ($data ['User'] ['isRequester'] == 1) {
						$this->Session->write ( "userId", $data ['User'] ['id'] );
						$this->Session->write ( "username", $data ['User'] ['username'] );
						$this->Session->write ( "isRequester", $data ['User'] ['isRequester'] );
						$this->Session->write ( "isWorker", 1 );
						$this->Session->write ( "isEnabled", $data ['User'] ['isEnabled'] );
						$info = 'Login success.';
						$this->Ajax->ajaxReturn ( $data, $info, 1 );
					} else {
						$this->Ajax->error ( "[$username] cannot login as a requester." );
					}
				
				} else {
					$info = "[$username] is disabled.";
					$this->Ajax->error ( $info );
				}
			
			} else {
				$info = 'Invalid username or password.';
				$this->Ajax->error ( $info );
			}
		
		} else {
			$info = 'Username or password cannot be empty';
			$this->Ajax->error ( $info );
		}
	}
	
	/**
	 * log out
	 */
	public function logout() {
		$this->Session->destroy ();
		$this->Ajax->success ( 'Logout success.' );
	}
	
	/**
	 * set a user as requester
	 * POST
	 * userId
	 * isRequester
	 */
	public function enableRequester() {
		$this->validRequester ();
		$postData = $this->params ['form'];
		if ($postData ['userId'] && is_numeric ( $postData ['userId'] )) {
			$userId = $postData ['userId'];
			$isRequester = 0;
			if ($postData ['isRequester'] == 1) {
				$isRequester = 1;
			}
			
			if ($this->User->read ( null, $userId )) {
				$this->User->id = $userId;
				$this->User->saveField ( 'isRequester', $isRequester );
				$this->Ajax->success ( 'Update success.' );
			} else {
				$this->Ajax->error ( 'No such user.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid userId.' );
		}
	}
	
	/**
	 * enable a user
	 * 
	 * diabled worker can log in but cannot submit HIT
	 */
	public function enableWorker() {
		$this->validRequester ();
		$postData = $this->params ['form'];
		if ($postData ['userId'] && is_numeric ( $postData ['userId'] )) {
			$userId = $postData ['userId'];
			$isEnabled = 0;
			if ($postData ['isEnabled'] == 1) {
				$isEnabled = 1;
			}
			
			if ($this->User->read ( null, $userId )) {
				$this->User->id = $userId;
				$this->User->saveField ( 'isEnabled', $isEnabled );
				$this->Ajax->success ( 'Update success.' );
			} else {
				$this->Ajax->error ( 'No such user.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid userId.' );
		}
	}
	
	/**
	 * A requester reject a payment
	 */
	public function rejectPayment() {
		$userId = $this->validRequester();
		$workerId = $this->params ['form'] ['workerId'];
		$workerRequestData = $this->Workerrequest->find ( 'first', array (//
'conditions' => array (//
'Workerrequest.worker_id' => $workerId, //
'Workerrequest.requester_id' => $userId, //
'Workerrequest.isActive' => 1 ), //
'recursive' => - 1 ) );
		if ($workerRequestData) {
			$this->Workerrequest->id = $workerRequestData['Workerrequest']['id'];
			$this->Workerrequest->saveField ( 'isActive', 0 );
			$this->Ajax->success ( "Reject payment success." );

		}else{
			$this->Ajax->error ( "Invalid action." );
		}
	}
	
	/**
	 * get a list of users are worker but not requester
	 */
	public function workerList($order = array(), $limit = 0, $page = 0, $offset = 0) {
		$this->validRequester ();
		
		$userData = $this->User->find ( 'all', array (//
'conditions' => array (//
'isRequester' => 0 ), //
'recursive' => - 1, //
'order' => $order, //
'limit' => $limit, //
'page' => $page, //
'offset' => $offset ) );
		$count = $this->User->find ( 'count', array (//
'conditions' => array (//
'isRequester' => 0 ), //
'recursive' => - 1 ) );
		$this->Ajax->ajaxReturn ( $userData, $count, 1 );
	
	}
	
	/**
	 * publish HIT
	 */
	public function createHIT() {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['id'] )) {
			unset ( $data ['id'] );
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		if (empty ( $data ['currencyCode'] )) {
			$data ['currencyCode'] = $this->CURRENCY_CODE;
		}
		if (empty ( $data ['maxHits'] )) {
			$data ['maxHits'] = 0;
		}
		
		$groupCondition = array ();
		$groupCondition ['Group.requester_id'] = $userId;
		$groupCondition ['Group.name'] = $data ['name'];
		$groupCondition ['Group.description'] = $data ['description'];
		$groupCondition ['Group.currencyCode'] = $data ['currencyCode'];
		$groupCondition ['Group.reward'] = $data ['reward'];
		$groupCondition ['Group.expireDate'] = $data ['expireDate'];
		$groupCondition ['Group.assignmentTime'] = $data ['assignmentTime'];
		$groupCondition ['Group.autoApprovalTime'] = $data ['autoApprovalTime'];
		$groupCondition ['Group.state'] = 'Active';
		
		$groupData = $this->Hit->Group->find ( 'first', array (//
'conditions' => $groupCondition, //
'recursive' => - 1, //
'order' => array ('Group.id DESC' ) ) );
		$groupId = 0;
		if ($groupData) { //set numAvailableHit+1 and get groupId
			$updateGroupData = array (//
'Group' => array (//
'id' => $groupData ['Group'] ['id'], //
'maxHits' => ($data ['maxHits'] > 0) ? ($data ['maxHits']) : ($groupData ['Group'] ['maxHits'] + 1), //
'numAvailableHit' => $groupData ['Group'] ['numAvailableHit'] + 1 ) );
			$this->Hit->Group->create ( $updateGroupData );
			$this->Hit->Group->save ( $updateGroupData );
			$groupId = $groupData ['Group'] ['id'];
		
		} else { //create a new hitGroup and get groupId
			$data ['requester_id'] = $userId;
			$saveGroupData = array ();
			$saveGroupData ['requester_id'] = $userId;
			$saveGroupData ['name'] = $data ['name'];
			$saveGroupData ['description'] = $data ['description'];
			$saveGroupData ['currencyCode'] = $data ['currencyCode'];
			$saveGroupData ['reward'] = $data ['reward'];
			$saveGroupData ['expireDate'] = $data ['expireDate'];
			$saveGroupData ['assignmentTime'] = $data ['assignmentTime'];
			$saveGroupData ['autoApprovalTime'] = $data ['autoApprovalTime'];
			$saveGroupData ['maxHits'] = ($data ['maxHits'] > 0) ? ($data ['maxHits']) : 1;
			$saveGroupData ['numCompletedHit'] = 0;
			$saveGroupData ['numAvailableHit'] = 1;
			$saveGroupData ['state'] = 'Active';
			$this->Hit->Group->create ( $saveGroupData );
			if ($this->Hit->Group->save ( $saveGroupData )) {
				$groupId = $this->Hit->Group->id;
			} else {
				$this->Ajax->error ( 'Insert group error.', $this->AJAX_RETURN_TYPE );
			}
		}
		
		if ($groupId != 0) { //create a new hit
			$data ['group_id'] = $groupId;
			$data ['requester_id'] = $userId;
			$data ['publishDate'] = $this->getCurrentTimeStamp ();
			$data ['state'] = 'Published';
			$this->Hit->create ( $data );
			$this->Hit->save ( $data );
			$data ['id'] = $this->Hit->getLastInsertID ();
			$this->Ajax->ajaxReturn ( $data, 'Create a new hit success.', 1, $this->AJAX_RETURN_TYPE );
		
		} else {
			$this->Ajax->error ( 'Create a new hit error.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * batch publish HIT, generate a new hitgroup
	 */
	public function createMultipleHIT() {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['id'] )) {
			unset ( $data ['id'] );
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		if (empty ( $data ['currencyCode'] )) {
			$data ['currencyCode'] = $this->CURRENCY_CODE;
		}
		$hitCount = count ( $data ['url'] );
		if (empty ( $data ['maxHits'] )) {
			$data ['maxHits'] = $hitCount;
		}
		
		$groupId = 0;
		$data ['requester_id'] = $userId;
		$saveGroupData = array ();
		$saveGroupData ['requester_id'] = $userId;
		$saveGroupData ['name'] = $data ['name'];
		$saveGroupData ['description'] = $data ['description'];
		$saveGroupData ['currencyCode'] = $data ['currencyCode'];
		$saveGroupData ['reward'] = $data ['reward'];
		$saveGroupData ['expireDate'] = $data ['expireDate'];
		$saveGroupData ['assignmentTime'] = $data ['assignmentTime'];
		$saveGroupData ['autoApprovalTime'] = $data ['autoApprovalTime'];
		$saveGroupData ['maxHits'] = $data ['maxHits'];
		$saveGroupData ['numCompletedHit'] = 0;
		$saveGroupData ['numAvailableHit'] = $hitCount;
		$saveGroupData ['state'] = 'Active';
		$this->Hit->Group->create ( $saveGroupData );
		if ($this->Hit->Group->save ( $saveGroupData )) {
			$groupId = $this->Hit->Group->id;
		} else {
			$this->Ajax->error ( 'Insert group error.', $this->AJAX_RETURN_TYPE );
		}
		
		if ($groupId != 0) { //create a new hit
			$hitData ['group_id'] = $groupId;
			$hitData ['name'] = $data ['name'];
			$hitData ['description'] = $data ['description'];
			$hitData ['currencyCode'] = $data ['currencyCode'];
			$hitData ['reward'] = $data ['reward'];
			
			$hitData ['publishDate'] = $this->getCurrentTimeStamp ();
			$hitData ['expireDate'] = $data ['expireDate'];
			$hitData ['assignmentTime'] = $data ['assignmentTime'];
			$hitData ['autoApprovalTime'] = $data ['autoApprovalTime'];
			
			$hitData ['requester_id'] = $userId;
			$hitData ['state'] = 'Published';
			
			foreach ( $data ['url'] as $i => $url ) {
				$hitData ['url'] = $url;
				$hitData ['frameHeight'] = $data ['frameHeight'] [$i];
				$this->Hit->create ( $hitData );
				$this->Hit->save ( $hitData );
			}
			
			$this->Ajax->ajaxReturn ( '', 'Duplicate HITs success.', 1, $this->AJAX_RETURN_TYPE );
		
		} else {
			$this->Ajax->error ( 'Create a new hit error.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * set hitGroup's maxHits
	 * POST $groupId, $maxHits
	 */
	public function setMaxHits() {
		$userId = $this->validRequester ();
		$groupId = $this->params ['form'] ['groupId'];
		$maxHits = $this->params ['form'] ['maxHits'];
		
		if (is_numeric ( $groupId ) && is_numeric ( $maxHits )) {
			$data = $this->Group->find ( 'first', array (//
'conditions' => array (//
'Group.id' => $groupId, //
'Group.requester_id' => $userId ), //
'recursive' => - 1 ) );
			if ($data) {
				$this->Group->id = $groupId;
				$this->Group->saveField ( 'maxHits', $maxHits );
				$this->Ajax->success ( 'Update success.', $this->AJAX_RETURN_TYPE );
			
			} else {
				$this->Ajax->error ( 'Invalid hitGroup.', $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid parameters.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * unpaid for a rquester, if no requesterId, show current user's	 
	 * userId(requesterId)
	 */
	public function pendingPayments($requesterId = null) {
		$userId = $this->validRequester ();
		$inputRequesterId = $userId;
		if ($requesterId) {
			$inputRequesterId = $requesterId;
		}
		
		$returnData = array ();
		if ($inputRequesterId && is_numeric ( $inputRequesterId )) {
			$data = $this->Hit->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.requester_id' => $inputRequesterId, //
'Assignment.state' => 'Approved' ), //
'recursive' => 0 ) );
			
			if ($data) {
				foreach ( $data as $assignment ) {
					$c = $assignment ['Hit'] ['currencyCode'];
					if (! isset ( $returnData [$c] )) {
						$returnData [$c] = array ('requesterId' => $inputRequesterId, 'currencyCode' => $c, 'pendingPayments' => 0 );
					}
					$returnData [$c] ['pendingPayments'] += $assignment ['Hit'] ['reward'];
				}
			}
			$this->Ajax->ajaxReturn ( $returnData, 'Get pendingPayments success.', 1 );
		
		} else {
			$this->Ajax->error ( 'Invalid requesterId.' );
		}
	}
	
	/**
	 * get current requester's workerRequest list	 
	 */
	public function pendingPaymentsDetail() {
		$requesterId = $this->validRequester ();
		$requestData = $this->Workerrequest->find ( 'all', array (//
'conditions' => array (//
'Workerrequest.requester_id' => $requesterId, //
'Workerrequest.isActive' => 1 ), //
'recursive' => - 1 ) );
		
		if ($requestData) {
			$returnData = array ();
			foreach ( $requestData as $i => $request ) {
				$workerId = $request ['Workerrequest'] ['worker_id'];
				$assignmentData = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.requester_id' => $requesterId, //
'Assignment.worker_id' => $workerId, //
'Assignment.state' => 'Approved' ), //
'recursive' => 1 ) );
				$workerData = $this->User->find ( 'first', array (//
'conditions' => array ('User.id' => $workerId ), //
'recursive' => - 1 ) );
				
				$d = array ();
				$d ['Worker'] = $workerData ['User'];
				$d ['Workerrequest'] = $request ['Workerrequest'];
				$d ['Assignments'] = array ();
				$ccArr = array ();
				foreach ( $assignmentData as $j => $v ) {
					$cc = $v ['Hit'] ['currencyCode'];
					$r = $v ['Hit'] ['reward'];
					$aId = $v ['Assignment'] ['id'];
					if (! isset ( $ccArr [$cc] )) {
						$ccArr [$cc] = array ('currencyCode' => $cc, 'pendingPayments' => 0, 'AssignmentIds' => array () );
					}
					$ccArr [$cc] ['pendingPayments'] += $r;
					array_push ( $ccArr [$cc] ['AssignmentIds'], $aId );
				}
				foreach ( $ccArr as $c ) {
					$d ['Assignments'] ['currencyCode'] = $c ['currencyCode'];
					$d ['Assignments'] ['pendingPayments'] = $c ['pendingPayments'];
					$d ['Assignments'] ['AssignmentIds'] = $c ['AssignmentIds'];
					array_push ( $returnData, $d );
				}
			}
			$this->Ajax->ajaxReturn ( $returnData, 'Get Pending Payments Detail success.', 1 );
		
		} else {
			$this->Ajax->error ( 'No data.' );
		}
	}
	
	/**
	 * set a hit expired. when HIT is locked, this method is not effective.	
	 * POST hitId
	 * 
	 * after success:
	 * [hit] state: 'Published'=>'Expired'
	 * [group] numAvailableHit=numAvailableHit-1
	 * [group] state?='Inactive'
	 * [assignment] state:'Accepted'=>'Expired'
	 */
	public function expireHIT() {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		$hitId = $this->params ['form'] ['hitId'];
		if ($hitId && is_numeric ( $hitId )) {
			$hitData = $this->Group->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.id' => $hitId, //
'Hit.requester_id' => $userId ), //
'recursive' => 0 ) );
			//print_r($hitData);
			if ($hitData) {
				$now = $this->getCurrentTimeStamp ();
				// FJ 2011-03-23: if (($hitData ['Hit'] ['expireDate'] < $now) || ($hitData ['Hit'] ['state'] == 'Expired')) {
				if (($hitData ['Hit'] ['state'] == 'Expired')) {
					$this->Ajax->error ( "This HIT has already expired, can't expire again." );
				}
				
				if ($hitData ['Hit'] ['state'] == 'Published') {
					//set [hit] state='Expired'
					$this->Hit->id = $hitId;
					$this->Hit->saveField ( 'state', 'Expired' );
					//set [group] numAvailableHit-1
					$this->Group->id = $hitData ['Group'] ['id'];
					$numAvailableHit = $hitData ['Group'] ['numAvailableHit'];
					$this->Group->saveField ( 'numAvailableHit', $numAvailableHit - 1 );
					//[group] state?='Inactive'
					$this->updateGroupState ( $hitData ['Group'] ['id'] );
					//set [assignment] state='Expired' (to fix exception)
					$assignmentDataArray = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.hit_id' => $hitId, //
'Assignment.state' => 'Accepted' ), //
'recursive' => - 1 ) );
					if ($assignmentDataArray) {
						foreach ( $assignmentDataArray as $assignmentData ) {
							$this->Assignment->id = $assignmentData ['Assignment'] ['id'];
							$this->Assignment->saveField ( 'finishDate', $now );
							$this->Assignment->saveField ( 'state', 'Expired' );
						}
					}
					$this->Ajax->success ( 'Expire HIT success.' );
				
				} else {
					$this->Ajax->error ( 'Expire HIT failed. HIT state = ' . $hitData ['Hit'] ['state'] );
				}
			} else {
				$this->Ajax->error ( 'HITId Not Found.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid HITId.' );
		}
	}
	
	/**
	 * expireHITGroup
	 * if and only if all HITs are Published (in a hitgroup) , this method works	 	
	 * POST groupId
	 */
	public function expireHITGroup() {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		$groupId = $this->params ['form'] ['groupId'];
		if ($groupId && is_numeric ( $groupId )) {
			$hitData = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.requester_id' => $userId ), //
'recursive' => - 1 ) );
			if ($hitData) {
				$now = $this->getCurrentTimeStamp ();
				// FJ 2011-02-23: if (($hitData ['Hit'] ['expireDate'] < $now) || ($hitData ['Hit'] ['state'] == 'Expired')) {
				if (($hitData ['Hit'] ['state'] == 'Expired')) {
					$this->Ajax->error ( "This HITGroup has already expired, can't expire again." );
				} else {
					$hitCount = $this->Hit->find ( 'count', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.requester_id' => $userId, //
'NOT' => array ('Hit.state' => 'Published' ) ), //
'recursive' => - 1 ) );
					if ($hitCount > 0) {
						$this->Ajax->error ( "There are $hitCount HITs state!='Published'" );
					
					} else {
						$this->Hit->updateAll ( //
array ('Hit.state' => "'Expired'", 'Group.state' => "'Inactive'", 'Group.numAvailableHit' => 0 ), //
array ('Hit.group_id' => $groupId ) );
						$this->Ajax->success ( 'Expire HITGroup success.' );
					}
				}
			
			} else {
				$this->Ajax->error ( "HITGroup Not Found." );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid groupId.' );
		}
	}
	
	/**
	 * duplicateHITGroup
	 * duplicate and publish a new hitgroup	 
	 * POST groupId
	 */
	public function duplicateHITGroup() {
		$userId = $this->validRequester ();
		$groupId = $this->params ['form'] ['groupId'];
		if ($groupId && is_numeric ( $groupId )) {
			$groupData = $this->Group->find ( 'first', array (//
'conditions' => array (//
'Group.requester_id' => $userId, //
'Group.id' => $groupId ), //
'recursive' => 1 ) );
			if ($groupData) {
				$now = $this->getCurrentTimeStamp ();
				if ($groupData ['Group'] ['expireDate'] < $now) {
					$this->Ajax->error ( 'This HITGroup has already expired, duplicate Failed.' );
				
				} else {
					$saveData = array ();
					$saveData ['Group'] = $groupData ['Group'];
					$saveData ['Hit'] = $groupData ['Hit'];
					unset ( $saveData ['Group'] ['id'] );
					//$groupData ['Group'] ['expireDate'] = $this->getCurrentTimeStamp ();
					$saveData ['Group'] ['maxHits'] = count ( $groupData ['Hit'] );
					$saveData ['Group'] ['numCompletedHit'] = 0;
					$saveData ['Group'] ['numAvailableHit'] = count ( $groupData ['Hit'] );
					$saveData ['Group'] ['state'] = 'Active';
					$this->Group->create ( $saveData ['Group'] );
					$this->Group->save ( $saveData ['Group'] );
					$newGroupId = $this->Group->getInsertID ();
					foreach ( $saveData ['Hit'] as $key => $value ) {
						unset ( $saveData ['Hit'] [$key] ['id'] );
						$saveData ['Hit'] [$key] ['group_id'] = $newGroupId;
						$saveData ['Hit'] [$key] ['state'] = 'Published';
					}
					$this->Hit->saveAll ( $saveData ['Hit'] );
					$this->Ajax->success ( 'Duplicate HITGroup success.' );
				}
			
			} else {
				$this->Ajax->error ( 'HITGroup Not Found.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid groupId.' );
		}
	}
	
	/**
	 * approveAssignment
	 * POST assignmentId, message
	 * assignmentId can be string or array
	 * 
	 * if [assignment]state='Submitted' then the method is effective after success:
	 * [hit]state: 'Locked'=>'Locked'
	 * [assignment]state: 'Submitted'=>'Approved'
	 * [user] acceptanceRatio
	 */
	public function approveAssignment() {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		
		$message = null;
		if (isset ( $data ['message'] )) {
			$message = $data ['message'];
		}
		if (isset ( $data ['assignmentId'] )) {
			$assignmentId = $data ['assignmentId'];
			$assignmentDataArray = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.id' => $assignmentId, //
'Assignment.state' => 'Submitted' ), //
'recursive' => - 1 ) );
			if ($assignmentDataArray) {
				foreach ( $assignmentDataArray as $assignment ) {
					$now = $this->getCurrentTimeStamp ();
					$saveData = array ();
					$saveData ['id'] = $assignment ['Assignment'] ['id'];
					$saveData ['finishDate'] = $now;
					$saveData ['state'] = 'Approved';
					$saveData ['message'] = $message;
					$this->Assignment->create ( $saveData );
					$this->Assignment->save ( $saveData );
					
					$workerId = $assignment ['Assignment'] ['worker_id'];
					$this->updateUserAcceptanceRatio ( $workerId );
				}
				$this->Ajax->success ( 'Approve assignment success.', $this->AJAX_RETURN_TYPE );
			
			} else {
				$this->Ajax->error ( 'No available assignment.', $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid assignmentId.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * rejectAssignment
	 * POST assignmentId, message
	 * assignmentId can be string or array
	 * 
	 * if [assignment]state='Submitted', the method is effective after success
	 * 
	 * ([hit] state='Published' && [group] numAvailableHit=numAvailableHit+1) 
	 * or
	 * ([hit] state='Expired' && [group]state?='Inactive')
	 * 
	 * [assignment] state:'Submitted'=>'Rejected'
	 * 
	 * [user] acceptanceRatio
	 * 
	 * the original HIT is set as Closed,
	 * No new hit published.	 
	 */
	public function rejectAssignment() {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		
		$message = null;
		if (isset ( $data ['message'] )) {
			$message = $data ['message'];
		}
		if (isset ( $data ['assignmentId'] )) {
			$assignmentId = $data ['assignmentId'];
			$assignmentDataArray = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.id' => $assignmentId, //
'Assignment.state' => 'Submitted' ), //
'recursive' => - 1 ) );
			if ($assignmentDataArray) {
				$now = $this->getCurrentTimeStamp ();
				foreach ( $assignmentDataArray as $assignment ) {
					$now = $this->getCurrentTimeStamp ();
					$saveData = array ();
					$saveData ['id'] = $assignment ['Assignment'] ['id'];
					$saveData ['finishDate'] = $now;
					$saveData ['state'] = 'Rejected';
					$saveData ['message'] = $message;
					$this->Assignment->create ( $saveData );
					$this->Assignment->save ( $saveData );
					
					$workerId = $assignment ['Assignment'] ['worker_id'];
					$this->updateUserAcceptanceRatio ( $workerId );
					
					// updage HIT info
					$hitId = $assignment ['Assignment'] ['hit_id'];
					$hitData = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.id' => $hitId ), //
'recursive' => - 1 ) );
					if ($hitData ['Hit'] ['state'] == 'Locked') {
						if ($hitData ['Hit'] ['expireDate'] > $now) {
							$this->Hit->id = $hitId;
							$this->Hit->saveField ( 'state', 'Published' );
							$groupId = $assignment ['Assignment'] ['group_id'];
							$groupData = $this->Group->read ( null, $groupId );
							$numAvailableHit = $groupData ['Group'] ['numAvailableHit'];
							$this->Group->id = $groupId;
							$this->Group->saveField ( 'numAvailableHit', $numAvailableHit + 1 );
						
						} else {
							$this->Hit->id = $hitId;
							$this->Hit->saveField ( 'state', 'Expired' );
							//[group]state?='Inactive'
							$groupId = $assignment ['Assignment'] ['group_id'];
							$this->updateGroupState ( $groupId );
						}
					}
				}
				$this->Ajax->success ( 'Reject assignment success.', $this->AJAX_RETURN_TYPE );
			
			} else {
				$this->Ajax->error ( 'No available assignment.', $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid assignmentId.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * payAssignment
	 * POST (array) assignmentId
	 * POST (string) paypalSenderEmail
	 */
	public function payAssignment() {
		$data = $this->params ['form'];
		//header ( "Content-Type: text/html; charset=utf-8" );
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		$paypalSenderEmail = $data ['paypalSenderEmail'];
		if ($paypalSenderEmail == $this->PAYPAL_API_EMAIL) {
			$this->Ajax->error ( 'PaypalSenderEmail CANNOT equal PAYPAL_API_EMAIL' );
		}
		$assignmentIdArray = $data ['assignmentId'];
		if ($assignmentIdArray && is_array ( $assignmentIdArray )) {
			$workerArray = array ();
			//$workerArray['receiverId'] = array();
			//$workerArray['receiverId']['Worker'] = array();
			//$workerArray['receiverId']['Assignment'] = array();
			//$workerArray['receiverId']['receiverAmount']
			$userData = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.id' => $assignmentIdArray, //
'Assignment.state' => 'Approved' ), //
'recursive' => 1 ) );
			$currencyCode = "";
			if ($userData) {
				//$this->Ajax->ajaxReturn ( $userData, 'Get data success.', 1, $this->AJAX_RETURN_TYPE );
				foreach ( $userData as $v ) {
					$receiverId = $v ['Worker'] ['id'];
					if (! isset ( $workerArray [$receiverId] )) {
						$workerArray [$receiverId] = array ();
						$workerArray [$receiverId] ['Worker'] = $v ['Worker'];
						$workerArray [$receiverId] ['Assignment'] = array ($v ['Assignment'] );
						$currencyCode = $v ['Hit'] ['currencyCode'];
						$workerArray [$receiverId] ['receiverAmount'] = $v ['Hit'] ['reward'];
					} else {
						if ($currencyCode == $v ['Hit'] ['currencyCode']) {
							array_push ( $workerArray [$receiverId] ['Assignment'], $v ['Assignment'] );
							$workerArray [$receiverId] ['receiverAmount'] += $v ['Hit'] ['reward'];
						} else {
							die ( "Multiple currencyCode is not allowed!" );
						}
					}
				}
				//$this->Ajax->ajaxReturn ( $workerArray, 'Get data success.', 1, $this->AJAX_RETURN_TYPE );
				//goto paypal
				$this->payReceipt ( $paypalSenderEmail, $workerArray, $currencyCode );
			
			} else {
				$this->Ajax->ajaxReturn ( $assignmentIdArray, 'Invalid assignmentId.', 0, $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid assignmentId.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * redirect page for paypal done
	 */
	public function paymentDetails() {
		//session_start();
		$this->setPaypalParameter ();
		if (isset ( $_GET ['cs'] )) {
			$_SESSION ['payKey'] = '';
		}
		try {
			if (isset ( $_POST ["payKey"] )) {
				$payKey = $_POST ["payKey"];
			}
			if (empty ( $payKey )) {
				$payKey = $_SESSION ['payKey'];
			}
			
			$request_array = array (//
"payKey" => $payKey, //
"requestEnvelope.errorLanguage" => 'en_US' );
			
			$nvpStr = http_build_query ( $request_array );
			$resArray = $this->Paypal->hashCall ( "AdaptivePayments/PaymentDetails", $nvpStr );
			
			/* Display the API response back to the browser.
			   If the response from PayPal was a success, display the response parameters'
			   If the response was an error, display the errors received using APIError.php.
			 */
			$ack = strtoupper ( $resArray ["responseEnvelope.ack"] );
			if ($ack != "SUCCESS") {
				$_SESSION ['reshash'] = $resArray;
				//$location = "APIError.php";
				//header ( "Location: $location" );
				$this->Paypal->showAPIError ();
			} else {
				$payKey = $resArray ['payKey'];
				if ($resArray ['status'] == 'COMPLETED') { //CREATED, COMPLETED
					$now = $this->getCurrentTimeStamp ();
					$this->completePayOrder ( $payKey, $now );
				}
			}
		
		} catch ( Exception $ex ) {
			throw new Exception ( 'Error occurred in PaymentDetails method' );
		}
		
		//		header ( "Content-Type: text/html; charset=utf-8" );
		//		$html = '';
		//		$html .= '
		//		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		//		<html xmlns="http://www.w3.org/1999/xhtml" >
		//		<head>
		//		<title>Payment Details</title>
		//		</head>
		//		<body style="background-color:#ccc;">
		//		<table style="text-align:left; margin:0 auto;">
		//			<tr>
		//				<td colspan="2"><b>Pay - Response</b></td>
		//			</tr>
		//		';
		//		foreach ( $resArray as $key => $value ) {
		//			$html .= "<tr><td> $key:</td><td>$value</td></tr>";
		//		}
		$payReturnURL = $this->PAY_RETURN_LINK;
		//		$html .= '<tr><td>';
		//		$html .= " <a href=\"$payReturnURL\"><b>* Click HERE to RETURN Website </b></a>";
		//		$html .= '</td></tr>';
		//		$html .= '</table>';
		//		$html .= '</body></html>';
		//		echo $html;
		header ( "Location: " . $payReturnURL );
	}
	
	/**
	 * get current requester's hit list
	 * @param int $groupId
	 */
	public function getHITList($groupId = null, $order = array(), $limit = 0, $page = 0, $offset = 0) {
		$userId = $this->validRequester ();
		
		$conditions = array ('Hit.group_id' => $groupId, 'Hit.requester_id' => $userId );
		if ($groupId == null || $groupId == "null" || ! is_numeric ( $groupId )) {
			$conditions = array ('Hit.requester_id' => $userId );
		}
		$hitData = $this->Hit->find ( 'all', array (//
'conditions' => $conditions, //
'recursive' => 1, //
'order' => $order, //
'limit' => $limit, //
'page' => $page, //
'offset' => $offset ) );
		foreach ( $hitData as $i => $data ) {
			foreach ( $data ['Assignment'] as $j => $assignmentData ) {
				$hitData [$i] ['Assignment'] [$j] ['data'] = null;
			}
		}
		
		$count = $this->Hit->find ( 'count', array (//
'conditions' => $conditions, //
'recursive' => - 1 ) );
		$this->Ajax->ajaxReturn ( $hitData, $count, 1 );
	}
	
	/**
	 * get current requester's hit's brief info
	 * Completed HITs:
	 * Submitted Assignments (Approval needed):
	 * Approved Assignments (Waiting for payment):
	 * Rejected Assignments
	 * Closed Assignments (match Completed HITs data)
	 * 
	 * @param int $groupId
	 */
	public function getHITSummary($groupId = null, $workerId = null) {
		$userId = $this->validRequester ();
		
		$conditions = array ('Hit.requester_id' => $userId );
		if (is_numeric ( $groupId )) {
			$conditions ['Hit.group_id'] = $groupId;
		}
		$hitData = $this->Hit->find ( 'all', array (//
'conditions' => $conditions, //
'recursive' => 1 ) );
		$hitCount = count ( $hitData );
		
		$completedHit = array ();
		$group = array ();
		$submittedAssignment = array ();
		$approvedAssignment = array ();
		$rejectedAssignment = array ();
		$closedAssignment = array ();
		foreach ( $hitData as $data ) {
			if (! $group && is_numeric ( $groupId )) {
				$group = $data ['Group'];
			}
			if ($data ['Hit'] ['state'] == 'Closed') {
				array_push ( $completedHit, $data ['Hit'] );
			}
			foreach ( $data ['Assignment'] as $assignment ) {
				$c = false;
				if ($workerId == null || $workerId == "null") {
					$c = true;
				} else {
					$c = $assignment ['worker_id'] == $workerId;
				}
				
				if ($assignment ['state'] == 'Submitted' && $c) {
					array_push ( $submittedAssignment, $assignment );
				}
				if ($assignment ['state'] == 'Approved' && $c) {
					array_push ( $approvedAssignment, $assignment );
				}
				if ($assignment ['state'] == 'Rejected' && $c) {
					array_push ( $rejectedAssignment, $assignment );
				}
				if ($assignment ['state'] == 'Closed' && $c) {
					array_push ( $closedAssignment, $assignment );
				}
			}
		}
		
		$hitSummaryData = array ();
		$hitSummaryData ['Group'] = $group;
		$hitSummaryData ['hitCount'] = $hitCount;
		$hitSummaryData ['CompletedHit'] = array ("length" => count ( $completedHit ) );
		$hitSummaryData ['SubmittedAssignment'] = array ("length" => count ( $submittedAssignment ) );
		$hitSummaryData ['ApprovedAssignment'] = array ("length" => count ( $approvedAssignment ) );
		$hitSummaryData ['RejectedAssignment'] = array ("length" => count ( $rejectedAssignment ) );
		$hitSummaryData ['ClosedAssignment'] = array ("length" => count ( $closedAssignment ) );
		$this->Ajax->ajaxReturn ( $hitSummaryData, "Get HIT Summary success.", 1 );
	}
	
	/**
	 * get HIT info given hitId
	 * GET hitId
	 */
	public function getHITInfo($hitId = null) {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}
		if (is_numeric ( $hitId )) {
			$hitData = $this->Hit->find ( 'first', array (//
'conditions' => array ('Hit.id' => $hitId, 'Hit.requester_id' => $userId ), //
'recursive' => 1 ) );
			if ($hitData) {
				foreach ( $hitData ['Assignment'] as $key => $value ) {
					if ($value ['data']) {
						//$data ['Assignment'] [$key] ['data']
						$hitData ['Assignment'] [$key] ['data'] = str_replace ( '<?xml version="1.0"?>', "", $value ['data'] );
					}
				}
				$this->Ajax->ajaxReturn ( $hitData, 'Get info success.', 1, $this->AJAX_RETURN_TYPE );
			} else {
				$this->Ajax->error ( 'No data.', $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid HIT id.', $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * get current requester's assignments list
	 * @param int $groupId
	 */
	public function getAssignmentList($groupId = null, $workerId = null, $assignmentState = null, $order = array(), $limit = 0, $page = 0) {
		$data = $this->params ['form'];
		if (! empty ( $data ['_DEFAULT_AJAX_RETURN'] )) {
			$this->AJAX_RETURN_TYPE = $data ['_DEFAULT_AJAX_RETURN'];
		}
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validRequester ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validRequester ();
		}

		$conditions = array ('Assignment.requester_id' => $userId );
		if (is_numeric ( $groupId )) {
			$conditions ['Assignment.group_id'] = $groupId;
		}
		if (is_numeric ( $workerId )) {
			$conditions ['Assignment.worker_id'] = $workerId;
		}
		if (in_array ( $assignmentState, array ('Accepted', 'Submitted', 'Approved', 'Closed', 'Rejected', 'Expired' ) )) {
			$conditions ['Assignment.state'] = $assignmentState;
		}
		$assignmentData = $this->Assignment->find ( 'all', array (//
'conditions' => $conditions, //
'recursive' => 0, //
'order' => $order, //
'limit' => $limit, //
'page' => $page ) );
		
		$count = $this->Assignment->find ( 'count', array (//
'conditions' => $conditions, //
'recursive' => - 1 ) );
		$this->Ajax->ajaxReturn ( $assignmentData, $count, 1 );
	}
	
	/**
	 * @param String $paypalSenderEmail
	 * @param Array $workerArray
	 */
	private function payReceipt($paypalSenderEmail, $workerArray = array(), $currencyCode) {
		//session_start();
		$this->setPaypalParameter ();
		
		header ( "Content-Type: text/html; charset=utf-8" );
		$post = array (//
'actionType' => 'PAY', //
'email' => $paypalSenderEmail );
		try {
			$serverName = $_SERVER ['SERVER_NAME'];
			$serverPort = $_SERVER ['SERVER_PORT'];
			$url = dirname ( 'http://' . $serverName . ':' . $serverPort . $_SERVER ['REQUEST_URI'] );
			$returnURL = $url . "/paymentDetails";
			//$cancelURL = $url . "/pay";
			$cancelURL = $this->PAY_RETURN_LINK;
			$preapprovalKey = '';
			$request_array = array (//
"actionType" => $post ['actionType'], //
"cancelUrl" => $cancelURL, //
"returnUrl" => $returnURL, //
"currencyCode" => $currencyCode, // USD, GBP, EUR, JPY, CAD, AUD
//"receiverList.receiver[0].amount" => $_POST ['amount'] [0], //
			//"receiverList.receiver[0].email" => $_POST ['receiveremail'] [0], //
			//"receiverList.receiver[0].primary[0]" => $_POST ['primaryReceiver'] [0], //
			"senderEmail" => $paypalSenderEmail, //
"clientDetails.deviceId" => $this->Paypal->DEVICE_ID, //
"clientDetails.ipAddress" => '127.0.0.1', //
"clientDetails.applicationId" => $this->Paypal->APPLICATION_ID, //
"requestEnvelope.errorLanguage" => 'en_US', //
"memo" => 'CTURK PAY', //
"feesPayer" => "SENDER" ); // EACHRECEIVER, PRIMARYRECEIVER, SENDER, SECONDARYONLY
			$i = 0;
			foreach ( $workerArray as $v ) {
				$receiverAmount = $v ['receiverAmount'];
				$receiverEmail = $v ['Worker'] ['paypalAccount'];
				$primary = "false";
				$request_array ["receiverList.receiver[$i].amount"] = $receiverAmount;
				$request_array ["receiverList.receiver[$i].email"] = $receiverEmail;
				$request_array ["receiverList.receiver[$i].primary[$i]"] = $primary;
				$i ++;
			}
			if ($preapprovalKey != "") {
				$request_array ["preapprovalKey"] = $preapprovalKey;
			}
			$nvpStr = http_build_query ( $request_array );
			
			/**
			 * Make the call to PayPal to get the Pay token
			 * If the API call succeded, then redirect the buyer to PayPal
			 * to begin to authorize payment.  If an error occured, show the
			 * resulting errors
			 */
			$resArray = $this->Paypal->hashCall ( 'AdaptivePayments/Pay', $nvpStr );
			
			/**
			 * Display the API response back to the browser.
			 * If the response from PayPal was a success, display the response parameters'
			 * If the response was an error, display the errors received using APIError.php.
			 */
			$ack = strtoupper ( $resArray ['responseEnvelope.ack'] );
			if ($ack != "SUCCESS") {
				$_SESSION ['reshash'] = $resArray;
				//$location = "APIError.php";
				//header ( "Location: $location" );
				$this->Paypal->showAPIError ();
			
			} else {
				$_SESSION ['payKey'] = $resArray ['payKey'];
				$payKey = $resArray ['payKey'];
				$now = $this->getCurrentTimeStamp ();
				if (($resArray ['paymentExecStatus'] == "COMPLETED")) {
					$case = "1";
					//add data to [cturk4_orders]
					//$resArray['payKey']
					//$resArray['paymentExecStatus']=='COMPLETED'
					$hasExistPaykey = $this->Payorder->find ( 'first', array (//
'conditions' => array (//
'Payorder.payKey' => $resArray ['payKey'] ), //
'recursive' => - 1 ) );
					if (! $hasExistPaykey) {
						foreach ( $workerArray as $v ) {
							$assignmentIds = '';
							foreach ( $v ['Assignment'] as $a ) {
								if ($assignmentIds == '') {
									$assignmentIds .= $a ['id'];
								} else {
									$assignmentIds .= ',' . $a ['id'];
								}
							}
							$data = array (//
'senderEmail' => $paypalSenderEmail, //
'receiver_id' => $v ['Worker'] ['id'], //
'receiverEmail' => $v ['Worker'] ['paypalAccount'], //
'receiverAmount' => $v ['receiverAmount'], //
'payKey' => $resArray ['payKey'], //
'assignmentIds' => $assignmentIds, //
'state' => 'CREATED', //
'createDate' => $now );
							$this->Payorder->create ( $data );
							$this->Payorder->save ( $data );
						}
						$this->completePayOrder ( $payKey, $now );
					}
				
				} else if (($post ['actionType'] == "PAY") && ($resArray ['paymentExecStatus'] == "CREATED")) {
					$case = "2";
					//add data to [cturk4_orders]
					//$resArray['payKey']
					//$resArray['paymentExecStatus']=='CREATED'
					foreach ( $workerArray as $v ) {
						$assignmentIds = '';
						foreach ( $v ['Assignment'] as $a ) {
							if ($assignmentIds == '') {
								$assignmentIds .= $a ['id'];
							} else {
								$assignmentIds .= ',' . $a ['id'];
							}
						}
						$data = array (//
'senderEmail' => $paypalSenderEmail, //
'receiver_id' => $v ['Worker'] ['id'], //
'receiverEmail' => $v ['Worker'] ['paypalAccount'], //
'receiverAmount' => $v ['receiverAmount'], //
'payKey' => $resArray ['payKey'], //
'assignmentIds' => $assignmentIds, //
'state' => 'CREATED', //
'createDate' => $now );
						$this->Payorder->create ( $data );
						$this->Payorder->save ( $data );
					}
				
				} else if (($preapprovalKey != null) && ($post ['actionType'] == "CREATE") && ($resArray ['paymentExecStatus'] == "CREATED")) {
					$case = "3";
				
				} else if (($post ['actionType'] == "CREATE") && ($resArray ['paymentExecStatus'] == "CREATED")) {
					$temp1 = $this->Paypal->API_USERNAME;
					$temp2 = str_replace ( '_api1.', '@', $temp1 );
					if ($temp2 == $post ["email"]) {
						$case = "3";
					} else {
						$case = "2";
					}
				}
			}
		
		} catch ( Exception $ex ) {
			throw new Exception ( 'Error occurred in PayReceipt method' );
		}
		
		$html = '';
		$html .= '
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html>
		<head>
		<title>Payment Details</title>
		</head>
		<body style="background-color:#ccc; text-align:center;">
		<table style="text-align:left; margin:0 auto;">
			<tr>
				<td colspan="2"><b>Pay - Response</b></td>
			</tr>
		';
		foreach ( $resArray as $key => $value ) {
			$html .= "<tr><td> $key:</td><td>$value</td></tr>";
		}
		$html .= '</table>';
		switch ($case) {
			case "1" :
				$payReturnURL = $this->PAY_RETURN_LINK;
				$html .= " <a href=\"$payReturnURL\"><b>* Click HERE to RETURN CTURK page </b></a>";
				break;
			case "2" :
				$token = $resArray ['payKey'];
				$payPalURL = $this->Paypal->PAYPAL_REDIRECT_URL . '_ap-payment&paykey=' . $token;
				$html .= " <a href=\"$payPalURL\"><b>* Redirect URL to Complete Payment </b></a><br />";
				header ( "Location: " . $payPalURL );
				break;
			case "3" :
				$token = $resArray ['payKey'];
				$payPalURL = $this->Paypal->PAYPAL_REDIRECT_URL . '_ap-payment&paykey=' . $token;
				$html .= " <a href=\"$payPalURL\"><b>* Redirect URL to Complete Payment </b></a><br />";
				header ( "Location: " . $payPalURL );
				//echo "<a href=SetPaymentOption.php?payKey=$payKey><b>* Set Payment Options(optional)</b></a><br />";
				//echo "<a href=ExecutePaymentOption.php?payKey=$payKey><b>* Execute Payment Options</b></a><br />";
				break;
		}
		$html .= '</body></html>';
		echo $html;
	}
	
	/**
	 * set paypal parameters
	 */
	private function setPaypalParameter() {
		$this->Paypal->APPLICATION_ID = $this->PAYPAL_APPLICATION_ID;
		$this->Paypal->API_USERNAME = $this->PAYPAL_API_USERNAME;
		$this->Paypal->API_PASSWORD = $this->PAYPAL_API_PASSWORD;
		$this->Paypal->API_SIGNATURE = $this->PAYPAL_API_SIGNATURE;
		$this->Paypal->API_ENDPOINT = $this->PAYPAL_API_ENDPOINT;
		$this->Paypal->PAYPAL_REDIRECT_URL = $this->PAYPAL_REDIRECT_URL;
	}
	
	/**
	 * $payorderId payment done
	 * @param String $payKey
	 * @param int $now
	 */
	private function completePayOrder($payKey, $now) {
		//[payorders] state: CREATED => COMPLETED
		$payorderData = $this->Payorder->find ( 'all', array (//
'conditions' => array (//
'Payorder.payKey' => $payKey, //
'Payorder.state' => 'CREATED' ), //
'recursive' => - 1 ) );
		$groupIdArray = array ();
		foreach ( $payorderData as $v ) {
			//[payorders] state: CREATED => COMPLETED
			$this->Payorder->save ( array (//
'id' => $v ['Payorder'] ['id'], //
'completeDate' => $now, //
'state' => 'COMPLETED' ) );
			
			//[assignment] state='Closed'
			//[hit] state='Closed', 
			//[group] state='Active'||'Inactive', numCompletedHIT 
			$assignmentIdArray = preg_split ( "/,/", $v ['Payorder'] ['assignmentIds'] );
			$assignmentDataArray = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.id' => $assignmentIdArray, //
'Assignment.state' => 'Approved' ), //
'recursive' => - 1 ) );
			foreach ( $assignmentDataArray as $a ) {
				$this->Assignment->id = $a ['Assignment'] ['id'];
				$this->Assignment->saveField ( 'state', 'Closed' );
				$this->Hit->id = $a ['Assignment'] ['hit_id'];
				$this->Hit->saveField ( 'state', 'Closed' );
				$groupId = $a ['Assignment'] ['group_id'];
				if (! in_array ( $groupId, $groupIdArray )) {
					array_push ( $groupIdArray, $groupId );
				}
			}
		}
		foreach ( $groupIdArray as $groupId ) {
			$hitData = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.state' => array ('Published', 'Locked' ) ), //
'recursive' => - 1 ) );
			if (! $hitData ['Hit']) {
				$this->Group->id = $groupId;
				$this->Group->saveField ( 'state', 'Inactive' );
			}
			// [group] numCompletedHIT （numCompletedHIT）property，
			// number of (HIT is CLOSE，and the corresponding Assigment is also CLOSE)
			// (i.e.，Rejected Assigment is not counted as competed HIT)
			$assignmentCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.group_id' => $groupId, //
'Assignment.state' => 'Closed' ), //
'recursive' => - 1 ) );
			$this->Group->id = $groupId;
			$this->Group->saveField ( 'numCompletedHit', $assignmentCount );
		}
		
		//update [workerrequest] isActive = 0 || 1
		$requesterId = $this->Session->read ( "userId" );
		$requestDataArray = $this->Workerrequest->find ( 'all', array (//
'conditions' => array (//
'Workerrequest.requester_id' => $requesterId, //
'Workerrequest.isActive' => 1 ), //
'recursive' => - 1 ) );
		foreach ( $requestDataArray as $requestData ) {
			$reqId = $requestData ['Workerrequest'] ['id'];
			$workerId = $requestData ['Workerrequest'] ['worker_id'];
			$aCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.requester_id' => $requesterId, //
'Assignment.worker_id' => $workerId, //
'Assignment.state' => 'Approved' ), //
'recursive' => - 1 ) );
			if ($aCount == 0) {
				$this->Workerrequest->id = $reqId;
				$this->Workerrequest->saveField ( 'isActive', 0 );
			}
		}
	}
	
	/**
	 * update  [user] acceptanceRatio
	 * [user] acceptanceRatio = num(approved assignments) / num(submitted assignments) 
	 * @param int $workerId
	 */
	private function updateUserAcceptanceRatio($workerId = null) {
		if (! empty ( $workerId )) {
			$approvedAssignmentCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.worker_id' => $workerId, //
'Assignment.state' => array ('Approved', 'Closed' ) ), //
'recursive' => - 1 ) );
			$submittedAssignmentCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.worker_id' => $workerId, //
'Assignment.state' => array ('Submitted', 'Approved', 'Closed', 'Rejected' ) ), //
'recursive' => - 1 ) );
			$acceptanceRatio = round ( 100 * $approvedAssignmentCount / $submittedAssignmentCount );
			$this->User->id = $workerId;
			$this->User->saveField ( 'acceptanceRatio', $acceptanceRatio );
		}
	}
	
	/**
	 * update [group]state
	 * @param int $groupId
	 */
	private function updateGroupState($groupId = null) {
		$hitCount = $this->Hit->find ( 'count', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'state' => array ('Published', 'Locked' ) ), //
'recursive' => - 1 ) );
		if ($hitCount <= 0) { //state='Inactive'
			$this->Group->id = $groupId;
			$this->Group->saveField ( 'state', 'Inactive' );
		}
	}
	
	/**
	 * assert the requester is effective
	 */
	private function validRequester($username = null, $password = null) {
		if (! empty ( $username ) && ! empty ( $password )) {
			$data = $this->User->find ( 'first', array (//
'conditions' => array (//
'User.username' => $username, //
'User.password' => md5 ( $password ) ), //
'recursive' => - 1 ) );
			if ($data) {
				if ($data ['User'] ['isActive'] == 1) {
					if ($data ['User'] ['isRequester'] == 1) {
						return $data ['User'] ['id'];
					
					} else {
						$this->Ajax->error ( 'Not requester.', $this->AJAX_RETURN_TYPE );
					}
				} else {
					$this->Ajax->error ( 'Disabled user.', $this->AJAX_RETURN_TYPE );
				}
			
			} else {
				$this->Ajax->error ( 'Invalid username or password.', $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			if ($this->isLoginUser ()) {
				if ($this->isRequester ()) {
					return $this->Session->read ( "userId" );
				
				} else {
					$this->Ajax->error ( 'Invalid requester.', $this->AJAX_RETURN_TYPE );
				}
			} else {
				$this->Ajax->error ( 'Invalid user.', $this->AJAX_RETURN_TYPE );
			}
		}
	}
}
?>