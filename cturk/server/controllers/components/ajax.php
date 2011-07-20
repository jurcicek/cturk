<?php
class AjaxComponent extends Object {
	
	public function ajaxReturn($data, $info = '', $status = 1, $type = 'JSON') {
		$result = array ();
		$result ['status'] = $status;
		$result ['info'] = $info;
		$result ['data'] = $data;
		if (strtoupper ( $type ) == 'JSON') {
			// return result in JSON to client, including the state info			
			header ( "Content-Type:text/javascript; charset=utf-8" );
			exit ( json_encode ( $result ) );
		} elseif (strtoupper ( $type ) == 'XML') {
			// return result in XML			
			header ( "Content-Type:text/xml; charset=utf-8" );
			exit ( $this->xml_encode ( $result ) );
		} elseif (strtoupper ( $type ) == 'HTML') {
			// return result in JSON to client, including the state info			
			header ( "Content-Type:text/html; charset=utf-8" );
			exit ( json_encode ( $result ) );
		} elseif (strtoupper ( $type ) == 'EVAL') {
			// return executable js scripts			
			header ( "Content-Type:text/html; charset=utf-8" );
			exit ( $data );
		} else {
			// TODO support more formats
		}
	}
	
	public function success($info, $type = 'JSON') {
		$this->ajaxReturn ( '', $info, 1, $type );
	}
	
	public function error($info, $type = 'JSON') {
		$this->ajaxReturn ( '', $info, 0, $type );
	}
	
	private function xml_encode($data, $encoding = 'utf-8', $root = "think") {
		$xml = '<?xml version="1.0" encoding="' . $encoding . '"?>';
		$xml .= '<' . $root . '>';
		$xml .= $this->data_to_xml ( $data );
		$xml .= '</' . $root . '>';
		return $xml;
	}
	
	private function data_to_xml($data) {
		if (is_object ( $data )) {
			$data = get_object_vars ( $data );
		}
		$xml = '';
		foreach ( $data as $key => $val ) {
			is_numeric ( $key ) && $key = "item id=\"$key\"";
			$xml .= "<$key>";
			$xml .= (is_array ( $val ) || is_object ( $val )) ? $this->data_to_xml ( $val ) : $val;
			list ( $key, ) = explode ( ' ', $key );
			$xml .= "</$key>";
		}
		return $xml;
	}
}
?>