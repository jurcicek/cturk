<?php
class HitsController extends AppController {
	
	var $name = 'Hits';
	
	var $autoRender = false;
	
	var $components = array ('Ajax' );
	
	/**
	* get HIT info given hitId
	* GET hitId
	*/
	public function info($hitId = null) {
		if (! empty ( $hitId ) && is_numeric ( $hitId )) {
			$data = $this->Hit->find ( 'first', array (//
'conditions' => array (//
'Hit.id' => $hitId ), //
'recursive' => 1 ) );
			if ($data) {
				if (! $this->isRequester ()) {
					foreach ( $data ['Assignment'] as $key => $value ) {
						if ($value ['state'] != "Accepted") {
							$data ['Assignment'] [$key] ['data'] = null;
						}
					}
				}
				$this->Ajax->ajaxReturn ( $data, 'Get info success.', 1 );
			} else {
				$this->Ajax->error ( 'No data.' );
			}
		
		} else {
			$this->Ajax->error ( 'Invalid hitId' );
		}
	}
}
?>
