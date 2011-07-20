<?php
class WorkersController extends AppController {
	
	var $name = 'Users';
	
	var $autoRender = false;
	
	var $components = array ('Ajax' );
	
	var $uses = array ('User', 'Hit', 'Assignment', 'Workerrequest' );
	
	/**
	 * worker login
	 */
	public function login() {
		$data = $this->params ['form'];
		if ($data && $data ['username'] && $data ['password']) {
			$username = $data ['username'];
			$password = md5 ( $data ['password'] );
			$conditions = array ("User.username" => $username, "User.password" => $password );
			$data = $this->User->find ( 'first', array (//
'conditions' => $conditions, //
'recursive' => - 1 ) );
			if ($data) {
				if ($data ['User'] ['isActive'] == 1) {
					$this->Session->write ( "userId", $data ['User'] ['id'] );
					$this->Session->write ( "username", $data ['User'] ['username'] );
					$this->Session->write ( "isRequester", $data ['User'] ['isRequester'] );
					$this->Session->write ( "isWorker", 1 );
					$this->Session->write ( "isEnabled", $data ['User'] ['isEnabled'] );
					$info = 'Login success.';
					$this->Ajax->ajaxReturn ( $data, $info, 1 );
				
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
	 * terminate account
	 */
	public function terminateAccount() {
		$userId = $this->validWorker ();
		
		// isActive 状态： 0, 1
		$this->User->id = $userId;
		$this->User->saveField ( 'isActive', 0 );
		$this->Ajax->success ( 'Update success.' );
	}
	
	/**
	 * show current worker's available HIT group id list (state=Active && numAvailableHit>0 && maxHITs available)
	 * for worker users
	 */
	public function availableHitGroupList($order = array(), $limit = 0, $page = 0, $offset = 0) {
		$userId = $this->validWorker ();
		$this->refreshHIT ();
		$now = $this->getCurrentTimeStamp ();
		
		$availGroupCount = $this->Group->find ( 'count', array (//
'conditions' => array (//
'Group.state' => 'Active', //
'Group.numAvailableHit >' => 0, //
'Group.expireDate >' => $now ), //
'recursive' => - 1 ) );
		
		if ($availGroupCount > 0) {
			$data = $this->Group->find ( 'all', array (//
'conditions' => array (//
'Group.state' => 'Active', //
'Group.numAvailableHit >' => 0, //
'Group.expireDate >' => $now ), //
'recursive' => 1 ) ); //
			//'order' => $order, 
			//'limit' => $limit, 
			//'page' => $page, 
			//'offset' => $offset
			$availHitGroup = array ();
			foreach ( $data as $key => $value ) {
				foreach ( $data [$key] ['Assignment'] as $aKey => $aValue ) {
					if ($aValue ['state'] == 'Expired' || $userId != $aValue ['worker_id']) {
						unset ( $data [$key] ['Assignment'] [$aKey] );
					}
				}
				if ($data [$key] ['Group'] ['maxHits'] > count ( $data [$key] ['Assignment'] )) {
					array_push ( $availHitGroup, $data [$key] );
				}
				//if (count ( $availHitGroup ) >= ($offset) + $limit * ($page + 1)) {
				//	break;
				//}
				$data [$key] ['Hit'] = array ();
				$data [$key] ['Assignment'] = array ();
			}
			$returnData = array ();
			$returnGroupCount = count ( $availHitGroup );
			if ($limit == 0) {
				$returnData = $availHitGroup;
			} else {
				$start = $offset + $limit * ($page - 1);
				$end = (($start + $limit) < $returnGroupCount) ? ($start + $limit) : $returnGroupCount;
				for($i = $start; $i < $end; $i ++) {
					array_push ( $returnData, $availHitGroup [$i] );
				}
			}
			$this->Ajax->ajaxReturn ( $returnData, $returnGroupCount, 1 );
		} else {
			$this->Ajax->ajaxReturn ( "", $availGroupCount, 1 );
		}
	}
	
	/**
	 * assert worker can accept this group'HIT
	 * @param $groupId
	 */
	public function hasAvailHIT($groupId = null) {
		$this->refreshHIT ();
		
		$userId = $this->validWorker ();
		if (! empty ( $groupId ) && is_numeric ( $groupId )) {
			$validHit = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Group.id' => $groupId, //
'Hit.state' => 'Published' ), //
'recursive' => 1 ) );
			if ($validHit) {
				//check [group] maxHits in [assignment] group_id
				$groupId = $validHit ['Group'] ['id'];
				$maxHits = $validHit ['Group'] ['maxHits'];
				$hitCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.group_id' => $groupId, //
'Assignment.worker_id' => $userId, //
'Assignment.state' => array ('Accepted', 'Submitted', 'Approved', 'Closed', 'Rejected' ) ), //
'recursive' => - 1 ) );
				if ($hitCount >= $maxHits) {
					$this->Ajax->error ( 'You have submitted more HITs than a maximum number of HITS allowed by the requester for one worker.' );
				} else {
					$this->Ajax->success ( 'hasAvailHIT.' );
				}
			
			} else {
				$this->Ajax->error ( 'No available hit.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid groupId.' );
		}
	}
	
	/**
	 * accept a hit
	 * 
	 * POST hitId
	 */
	public function acceptHIT() {
		$this->refreshHIT ();
		
		$data = $this->params ['form'];
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validWorker ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validWorker ();
		}

		if (! $this->isEnabledWorker ()) {
			$this->Ajax->error ( 'Disabled worker.' );
		}
		$hitId = $this->params ['form'] ['hitId'];
		if (! empty ( $hitId ) && is_numeric ( $hitId )) {
			$validHit = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.id' => $hitId, //
'Hit.state' => 'Published' ), //
'recursive' => 1 ) );
			if ($validHit) {
				//check [group] maxHits in [assignment] group_id
				$groupId = $validHit ['Group'] ['id'];
				$maxHits = $validHit ['Group'] ['maxHits'];
				$hitCount = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.group_id' => $groupId, //
'Assignment.worker_id' => $userId, //
'Assignment.state' => array ('Accepted', 'Submitted', 'Approved', 'Closed', 'Rejected' ) ), //
'recursive' => - 1 ) );
				if ($hitCount >= $maxHits) {
					$this->Ajax->error ( 'You have submitted more HITs than a maximum number of HITS allowed by the requester for one worker.' );
				}
				
				//$this->Ajax->ajaxReturn ( $validHit, '', 1 );
				//[assignment] add data
				$now = $this->getCurrentTimeStamp ();
				$numAvailableHit = $validHit ['Group'] ['numAvailableHit'];
				$hitRequesterId = $validHit ['Hit'] ['requester_id'];
				$expireDate = $now + $validHit ['Hit'] ['assignmentTime'] * 1000;
				$assignmentExpireDate = ($expireDate <= $validHit ['Hit'] ['expireDate']) ? $expireDate : $validHit ['Hit'] ['expireDate'];
				$assignmentData = array (//
'requester_id' => $hitRequesterId, //
'worker_id' => $userId, //
'hit_id' => $hitId, //
'group_id' => $groupId, //
'acceptDate' => $now, //
'expireDate' => $assignmentExpireDate, //
'state' => 'Accepted' );
				$this->Assignment->create ( $assignmentData );
				if ($this->Assignment->save ( $assignmentData )) {
					$assignmentId = $this->Assignment->getLastInsertID ();
					$this->Hit->id = $hitId;
					$this->Hit->saveField ( 'state', 'Locked' );
					$this->Group->id = $groupId;
					$this->Group->saveField ( 'numAvailableHit', $numAvailableHit - 1 );
					
					$returnData = new stdClass ();
					$returnData->hitId = $hitId;
					$returnData->assignmentId = $assignmentId;
					$returnData->userId = $userId;
					$this->Ajax->ajaxReturn ( $returnData, 'Accept HIT success.', 1 );
				
				} else {
					$this->Ajax->error ( 'Add assignmentData error' );
				}
			
			} else {
				$this->Ajax->error ( 'No available hitId.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid hitId.' );
		}
	}
	
	/**
	 * release a hit
	 * 
	 * POST assignmentId
	 */
	public function releaseHIT() {
		$this->refreshHIT ();
		
		$data = $this->params ['form'];
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validWorker ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validWorker ();
		}
		
		$assignmentId = $this->params ['form'] ['assignmentId'];
		if (! empty ( $assignmentId ) && is_numeric ( $assignmentId )) {
			$assignmentData = $this->Assignment->find ( 'first', array (//
'conditions' => array (//
'Assignment.id' => $assignmentId, //
'Assignment.worker_id' => $userId, //
'Assignment.state' => 'Accepted' ), //
'recursive' => 1 ) );
			if ($assignmentData) {
				//$this->Ajax->ajaxReturn ( $assignmentData, 'Release HIT success.', 1 );
				//[assignment] state='Expired'
				$this->Assignment->id = $assignmentId;
				$this->Assignment->saveField ( 'state', 'Expired' );
				//[hit] state='Published'
				if ($assignmentData ['Hit'] ['state'] == 'Locked') {
					$this->Hit->id = $assignmentData ['Hit'] ['id'];
					if ($assignmentData ['Hit'] ['expireDate'] > $this->getCurrentTimeStamp ()) {
						$this->Hit->saveField ( 'state', 'Published' );
					} else {
						$this->Hit->saveField ( 'state', 'Expired' );
					}
					//[cturk_group] numAvailableHit+1
					$this->Group->id = $assignmentData ['Group'] ['id'];
					$numAvailableHit = $assignmentData ['Group'] ['numAvailableHit'];
					$this->Group->saveField ( 'numAvailableHit', $numAvailableHit + 1 );
					$this->Ajax->success ( 'Release HIT success.' );
				
				} else {
					$this->Ajax->error ( 'Exception HIT state.' );
				}
			
			} else {
				$this->Ajax->error ( 'No available assignmentId.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid assignmentId.' );
		}
	}
	
	/**
	 * get a worker user (given userId)'s accepted but not expired hits list	 
	 * HIT's corresponding assigment is ACCEPTED
	 * 
	 */
	public function acceptedHITs($order = array(), $limit = 0, $page = 0, $offset = 0) {
		$this->refreshHIT ();
		$userId = $this->validWorker ();
		
		$data = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.worker_id' => $userId, //
'Assignment.state' => 'Accepted' ), //
'recursive' => 1, //
'order' => $order, //
'limit' => $limit, //
'page' => $page, //
'offset' => $offset ) );
		$count = $this->Assignment->find ( 'count', array (//
'conditions' => array (//
'Assignment.worker_id' => $userId, //
'Assignment.state' => 'Accepted' ), //
'recursive' => - 1 ) );
		$this->Ajax->ajaxReturn ( $data, $count, 1 );
	}
	
	/**
	 * get current worker's assignment list
	 * @param int $groupId
	 */
	public function getAssignmentList($groupId = null, $workerId = null, $assignmentState = null, $order = array(), $limit = 0, $page = 0) {
		$userId = $this->validWorker ();
		
		$conditions = array ('Assignment.worker_id' => $userId );
		if (in_array ( $assignmentState, array ('Submitted', 'Approved', 'Closed', 'Rejected' ) )) {
			$conditions ['Assignment.state'] = $assignmentState;
		} else {
			$conditions ['Assignment.state'] = array ('Submitted', 'Approved', 'Closed', 'Rejected' );
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
	 * submit data from the other pages
	 * 
	 * iFrame url parameters
	 * <Preview>
	 * hitId=1
	 * assignmentId=ASSIGNMENT_ID_NOT_AVAILABLE
	 * <Accepted>
	 * hitId
	 * assignmentId
	 * workerId
	 * 
	 * POST data
	 * assignmentId
	 */
	public function externalSubmit() {
		$this->AJAX_RETURN_TYPE = 'HTML';
		$data = $this->params ['form'];
		if (isset ( $data ['_username'] ) && isset ( $data ['_password'] )) {
			$userId = $this->validWorker ( $data ['_username'], $data ['_password'] );
		} else {
			$userId = $this->validWorker ();
		}
		// get assignment id from POST
        $usedGet = 0;
		if ( isset ($data ['assignmentId']) ) {
    		$assignmentId = $data ['assignmentId'];
    		unset ( $data ['assignmentId'] );
        }
        else {
    		// also allow to get data from GET
    		$assignmentId = $this->params ['url'] ['assignmentId'];
    		unset ( $this->params ['url'] ['assignmentId'] );
    		$usedGet = 1;
        }

		if ($assignmentId && is_numeric ( $assignmentId )) {
			$sarchData = $this->Assignment->find ( 'first', array (//
'conditions' => array (//
'Assignment.id' => $assignmentId, //
'Assignment.worker_id' => $userId, //
'Assignment.state' => 'Accepted' ), //
'recursive' => - 1 ) );
			if ($sarchData) {
				$submittedData = $this->getAnswerXml ( $this->params ['form'] );
				if ($usedGet) {
                    $submittedData = $this->getAnswerXml ( $this->params ['url'] );
                }
                
				$data = array ();
				$data ['id'] = $assignmentId;
				$data ['submitDate'] = $this->getCurrentTimeStamp ();
				$data ['data'] = $submittedData;
				$data ['state'] = 'Submitted';
				$this->Assignment->create ( $data );
				if (false !== $this->Assignment->save ( $data, false )) {
					$this->Ajax->success ( 'Save data success.', $this->AJAX_RETURN_TYPE );
				} else {
					$this->Ajax->error ( 'Save data error.', $this->AJAX_RETURN_TYPE );
				}
			} else {
				$this->Ajax->error ( "Invalid assignmentId.", $this->AJAX_RETURN_TYPE );
			}
		
		} else {
			$this->Ajax->error ( "Invalid assignmentId.", $this->AJAX_RETURN_TYPE );
		}
	}
	
	/**
	 * A worker request a payment
	 */
	public function requestPayment() {
		$userId = $this->validWorker ();
		$requesterId = $this->params ['form'] ['requesterId'];
		$workerRequestData = $this->Workerrequest->find ( 'first', array (//
'conditions' => array (//
'Workerrequest.worker_id' => $userId, //
'Workerrequest.requester_id' => $requesterId, //
'Workerrequest.isActive' => 1 ), //
'recursive' => - 1 ) );
		if (! $workerRequestData) {
			$data = array (//
"worker_id" => $userId, //
"requester_id" => $requesterId, //
"createDate" => $this->getCurrentTimeStamp (), //
"isActive" => "1" );
			$this->Workerrequest->create ( $data );
			$this->Workerrequest->save ( $data );
		}
		$this->Ajax->success ( "RequestPayment success." );
	}
	
	/**
	 * worker's pending payments。if not given userId, get the current user's
	 * userId(workerId)
	 */
	public function pendingPayments() {
		$userId = $this->validWorker ();
		$inputUserId = $userId;
		if (isset ( $this->params ['pass'] [0] )) {
			$inputUserId = $this->params ['pass'] [0];
		}
		if ($inputUserId != $userId && ! $this->isRequester ()) {
			$this->Ajax->error ( 'Permission required.' );
		}
		
		$returnData = array ();
		if ($inputUserId && is_numeric ( $inputUserId )) {
			$data = $this->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.worker_id' => $inputUserId, //
'Assignment.state' => 'Approved' ), //
'recursive' => 1 ) );
			
			//print_r ( $data );
			if ($data) {
				foreach ( $data as $v ) {
					$c = $v ['Hit'] ['currencyCode'];
					if (! isset ( $returnData [$c] )) {
						$returnData [$c] = array ('userId' => $inputUserId, 'currencyCode' => $c, 'pendingPayments' => 0 );
					}
					$returnData [$c] ['pendingPayments'] += $v ['Hit'] ['reward'];
				}
			}
			$this->Ajax->ajaxReturn ( $returnData, 'Get pendingPayments success.', 1 );
		
		} else {
			$this->Ajax->error ( 'Invalid userId parameter.' );
		}
	}
	
	/**
	 * get current user's pending payment detials
	 */
	public function pendingPaymentsDetail() {
		$userId = $this->validWorker ();
		
		$userData = $this->User->find ( 'all', array (//
'conditions' => array (//
'isRequester' => 1 ), //
'recursive' => - 1 ) );
		$data = array ();
		$key = 0;
		foreach ( $userData as $user ) {
			$requesterId = $user ['User'] ['id'];
			$assignmentData = $this->Hit->Assignment->find ( 'all', array (//
'conditions' => array (//
'Assignment.requester_id' => $requesterId, //
'Assignment.worker_id' => $userId, //
'Assignment.state' => 'Approved' ), //
'recursive' => 0 ) );
			
			if ($assignmentData) {
				$data [$key] = $user;
				$data [$key] ['Assignments'] = $assignmentData;
				
				$workerRequestData = $this->Workerrequest->find ( 'first', array (//
'conditions' => array (//
'Workerrequest.worker_id' => $userId, //
'Workerrequest.requester_id' => $requesterId, //
'Workerrequest.isActive' => 1 ), //
'recursive' => - 1 ) );
				$data [$key] ['Workerrequest'] = $workerRequestData ['Workerrequest'];
				$key ++;
			}
		
		}
		if ($data) {
			$this->Ajax->ajaxReturn ( $data, 'Get pendingPaymentsDetail success.', 1 );
		} else {
			$this->Ajax->error ( 'No data.' );
		}
	}
	
	/**
	 * create Answer node
	 * @param DOMDocument $doc
	 * @param String $key
	 * @param String $value
	 * @return newnode
	 */
	private function createAnswerNode($doc, $key, $value) {
		$xml = $doc->createElement ( "Answer" );
		$k = $doc->createElement ( "key" );
		$k->appendChild ( $doc->createTextNode ( $key ) );
		$v = $doc->createElement ( "value" );
		$v->appendChild ( $doc->createTextNode ( $value ) );
		$xml->appendChild ( $k );
		$xml->appendChild ( $v );
		return $xml;
	}
	
	/**
	 * create xml
	 * @param Array $data
	 * @return String
	 */
	private function getAnswerXml($data) {
		$doc = new DOMDocument ();
		$doc->formatOutput = true;
		$r = $doc->createElement ( "Answers" );
		$doc->appendChild ( $r );
		foreach ( $data as $key => $value ) {
			if (is_string ( $value )) {
				$r->appendChild ( $this->createAnswerNode ( $doc, $key, $value ) );
			
			} else if (is_array ( $value )) {
				foreach ( $value as $k => $v ) {
					$r->appendChild ( $this->createAnswerNode ( $doc, $key . "[$k]", $v ) );
				}
			}
		}
		return $doc->saveXML ();
	}
	/**
	 * assert a worker is valid
	 */
	private function validWorker($username = null, $password = null) {
		if (! empty ( $username ) && ! empty ( $password )) {
			$data = $this->User->find ( 'first', array (//
'conditions' => array (//
'User.username' => $username, //
'User.password' => md5 ( $password ) ), //
'recursive' => - 1 ) );
			if ($data) {
				if ($data ['User'] ['isActive'] == 1) {
					$this->Session->write ( "isRequester", $data ['User'] ['isRequester'] );
					$this->Session->write ( "isWorker", 1 );
					$this->Session->write ( "isEnabled", $data ['User'] ['isEnabled'] );
    				return $data ['User'] ['id'];
			} else {
					$this->Ajax->error ( 'Disabled user.', $this->AJAX_RETURN_TYPE );
				}

			} else {
				$this->Ajax->error ( 'Invalid username or password.', $this->AJAX_RETURN_TYPE );
			}

		} else {

    		if ($this->isLoginUser ()) {
    			if ($this->isWorker ()) {
    				//valid worker
    				return $this->Session->read ( "userId" );

    			} else {
    				$this->Ajax->error ( 'Invalid worker.', $this->AJAX_RETURN_TYPE );
    			}
    		} else {
    			$this->Ajax->error ( 'Invalid user.', $this->AJAX_RETURN_TYPE );
    		}
	   }
	}
}
?>