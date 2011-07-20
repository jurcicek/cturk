<?php
class GroupsController extends AppController {
	
	var $name = 'Groups';
	
	var $autoRender = false;
	
	var $components = array ('Ajax' );
	
	var $uses = array ('User', 'Group', 'Hit', 'Assignment' );
	
	/**
	 * get available HIT group id list (state=Active && numAvailableHit>0)
	 * for worker users
	 */
	public function availableHitGroupList($order = array(), $limit = 0, $page = 0, $offset = 0) {
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
'recursive' => 1, //
'order' => $order, //
'limit' => $limit, //
'page' => $page, //
'offset' => $offset ) );
			if (! $this->isRequester ()) {
				foreach ( $data as $key => $value ) {
					$data [$key] ['Hit'] = array ();
					$data [$key] ['Assignment'] = array ();
				}
			} else {
				foreach ( $data as $key => $value ) {
					$data [$key] ['Hit'] = array ();
				}
			}
			$this->Ajax->ajaxReturn ( $data, $availGroupCount, 1 );
		} else {
			$this->Ajax->ajaxReturn ( "", $availGroupCount, 1 );
		}
	}
	
	/**
	 * [Active] HITGroup
	 */
	public function activeHitGroupList($order = array(), $limit = 0, $page = 0, $offset = 0) {
		if ($this->isRequester ()) {
			$this->refreshHIT ();
			$userId = $this->Session->read ( "userId" );
			$groupCount = $this->Group->find ( 'count', array (//
'conditions' => array (//
'Group.requester_id' => $userId, //
'Group.state' => 'Active' ), //
'recursive' => - 1 ) );
			if ($groupCount > 0) {
				$data = $this->Group->find ( 'all', array (//
'conditions' => array (//
'Group.requester_id' => $userId, //
'Group.state' => 'Active' ), //
'recursive' => 1, //
'order' => $order, //
'limit' => $limit, //
'page' => $page, //
'offset' => $offset ) );
				foreach ( $data as $key => $value ) {
					$data [$key] ['Hit'] = array ();
					$data [$key] ['Assignment'] = array ();
				}
				$this->Ajax->ajaxReturn ( $data, $groupCount, 1 );
			
			} else {
				$this->Ajax->ajaxReturn ( "", $groupCount, 1 );
			}
		
		} else {
			$this->Ajax->error ( 'Not requester.' );
		}
	}
	
	/**
	 * [Inactive] HITGroup
	 */
	public function inactiveHitGroupList($order = array(), $limit = 0, $page = 0, $offset = 0) {
		if ($this->isRequester ()) {
			$this->refreshHIT ();
			$userId = $this->Session->read ( "userId" );
			$groupCount = $this->Group->find ( 'count', array (//
'conditions' => array (//
'Group.requester_id' => $userId, //
'Group.state' => 'Inactive' ), //
'recursive' => - 1 ) );
			if ($groupCount > 0) {
				$data = $this->Group->find ( 'all', array (//
'conditions' => array (//
'Group.requester_id' => $userId, //
'Group.state' => 'Inactive' ), //
'recursive' => 1, //
'order' => $order, //
'limit' => $limit, //
'page' => $page, //
'offset' => $offset ) );
				foreach ( $data as $key => $value ) {
					$data [$key] ['Hit'] = array ();
					$data [$key] ['Assignment'] = array ();
				}
				$this->Ajax->ajaxReturn ( $data, $groupCount, 1 );
			
			} else {
				$this->Ajax->ajaxReturn ( "", $groupCount, 1 );
			}
		} else {
			$this->Ajax->error ( 'Not requester.' );
		}
	}
	
	/**
	 * get HITGroup's info given groupId
	 * GET groupId
	 */
	public function info($groupId = null) {
		if ($this->isRequester ()) {
			if (! empty ( $groupId ) && is_numeric ( $groupId )) {
				$data = $this->Group->find ( 'first', array (//
'conditions' => array (//
'Group.id' => $groupId ), //
'recursive' => 1 ) );
				if ($data) {
					if ($this->Session->read ( "userId" ) == $data ['Group'] ['requester_id']) {
						unset ( $data ['Assignment'] );
						$this->Ajax->ajaxReturn ( $data, 'Get info success.', 1 );
					} else {
						$this->Ajax->error ( 'No permission.' );
					}
				
				} else {
					$this->Ajax->error ( 'No data.' );
				}
			
			} else {
				$this->Ajax->error ( 'Invalid groupId' );
			}
		} else {
			$this->Ajax->error ( 'Invalid requester.' );
		}
	}
	
	/**
	 * random select a hit given groupId
	 */
	public function previewHIT($groupId = null) {
		$hitCount = $this->Hit->find ( 'count', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.state' => 'Published' ), //
'recursive' => - 1 ) );
		
		if ($hitCount > 0) {
			$offset = mt_rand ( 0, $hitCount - 1 );
			$hitData = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.group_id' => $groupId, //
'Hit.state' => 'Published' ), //
'recursive' => 1, //
'offset' => $offset ) );
			if ($hitData) {
				if (! $this->isRequester ()) {
					$hitData ['Assignment'] = array ();
				}
				$this->Ajax->ajaxReturn ( $hitData, "Preview HIT success.", 1 );
			} else {
				$this->Ajax->error ( "No data." );
			}
		
		} else {
			$this->Ajax->error ( "No data." );
		}
	}
}
?>